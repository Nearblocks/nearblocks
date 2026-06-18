#!/usr/bin/env node
// Live proof: decode FT balances directly from on-chain STATE CHANGES and verify
// each decoded value against ft_balance_of at the same block.
//
// Needs egress to ONE NEAR RPC host that supports EXPERIMENTAL_changes*.
// Usage:
//   node scripts/ft-state-decode-proof.mjs [blockHeight]
//   RPC_URL=https://your-rpc node scripts/ft-state-decode-proof.mjs [blockHeight]
//
// Default RPC is free.rpc.fastnear.com. NOTE: rpc.mainnet.near.org is DEPRECATED and
// now answers every request with HTTP 200 + a -429 "STOP USING IT" error body, which
// silently zeroed this proof's verify step — do not use it.
//
// Proves: the value in a `data_update` state change == the contract's real balance
// (same number ft_balance_of returns) — i.e. balances can be read from blocks we
// already ingest, with no dependence on NEP-141 events and no per-read RPC.

const RPC_URL = process.env.RPC_URL || 'https://free.rpc.fastnear.com';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rpc(method, params, tries = 3) {
  let lastErr;
  for (let t = 0; t < tries; t++) {
    let res;
    try {
      res = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });
    } catch (e) {
      throw new Error(`network error to ${RPC_URL}: ${e.message}`);
    }
    const text = await res.text();
    if (text.includes('not in allowlist')) {
      const host = new URL(RPC_URL).host;
      throw new Error(
        `EGRESS BLOCKED — add "${host}" to this environment's network allowlist (and start a fresh web session if it was just changed).\n  proxy said: ${text.trim()}`,
      );
    }
    let j;
    try {
      j = JSON.parse(text);
    } catch {
      throw new Error(
        `non-JSON from ${RPC_URL} (http ${res.status}): ${text.slice(0, 200)}`,
      );
    }
    if (j.error) {
      const msg = JSON.stringify(j.error);
      if (msg.includes('429') || msg.includes('DEPRECATED')) {
        lastErr = new Error(`rpc ${method}: ${msg}`);
        await sleep(250);
        continue;
      }
      throw new Error(`rpc ${method}: ${msg}`);
    }
    return j.result;
  }
  throw lastErr;
}

// near-contract-standards FungibleToken: accounts: LookupMap<AccountId, Balance>
//   key   = <prefix bytes> ++ borsh(account_id) = <prefix> ++ <u32-LE len> ++ utf8
//   value = borsh(u128) = 16 little-endian bytes
function decode(change) {
  const v = Buffer.from(change.value_base64, 'base64');
  if (v.length !== 16) return null; // not a u128 balance slot
  const balance = v.readBigUInt64LE(0) + (v.readBigUInt64LE(8) << 64n); // u128 LE
  const k = Buffer.from(change.key_base64, 'base64');
  for (let i = 0; i + 4 <= k.length; i++) {
    // find <prefix><u32 len><utf8 acct>
    const len = k.readUInt32LE(i);
    if (len >= 2 && len <= 64 && i + 4 + len === k.length) {
      const account = k.subarray(i + 4).toString('utf8');
      if (/^[a-z0-9._-]+$/.test(account))
        return {
          contract: change.account_id,
          account,
          balance: balance.toString(),
        };
    }
  }
  return null; // non-standard layout -> RPC fallback
}

// Returns the balance string, or null when the contract is provably not a standard
// NEP-141 (no ft_balance_of / it panics) — i.e. an FT-SHAPED-but-not-an-FT slot
// (DEX/router internal maps). Transport/RPC errors are re-thrown, never swallowed,
// so a flaky endpoint can't masquerade as "not an FT".
async function ftBalanceOf(contract, account, blockId) {
  let r;
  try {
    r = await rpc('query', {
      request_type: 'call_function',
      block_id: blockId,
      account_id: contract,
      method_name: 'ft_balance_of',
      args_base64: Buffer.from(
        JSON.stringify({ account_id: account }),
      ).toString('base64'),
    });
  } catch (e) {
    // A contract-level failure (MethodResolveError / panic / no such method) means
    // it isn't a standard FT. Anything else (timeout, 429, network) must propagate.
    const m = e.message;
    if (
      /MethodNotFound|MethodResolveError|CompilationError|cannot find|doesn't exist|FunctionCallError|panicked|GuestPanic|deserialize/i.test(
        m,
      )
    )
      return null;
    throw e;
  }
  if (!r || !Array.isArray(r.result)) return null; // unexpected shape -> treat as non-FT
  return JSON.parse(Buffer.from(r.result).toString());
}

// Decode every FT-balance-shaped data_update slot in one block, grouped by contract.
async function decodeBlock(height) {
  const inBlock = await rpc('EXPERIMENTAL_changes_in_block', {
    block_id: height,
  });
  const touched = [
    ...new Set(
      inBlock.changes
        .filter((c) => c.type === 'data_touched')
        .map((c) => c.account_id),
    ),
  ];
  if (!touched.length) return new Map();
  const dc = await rpc('EXPERIMENTAL_changes', {
    changes_type: 'data_changes',
    account_ids: touched.slice(0, 80),
    key_prefix_base64: '',
    block_id: height,
  });
  // LAST-WRITE-WINS per (contract, account): an account can be written several times
  // in one block (multiple receipts). EXPERIMENTAL_changes returns them in order, and
  // ONLY the final write equals ft_balance_of at that block — so keep the last one.
  const lastWrite = new Map(); // `${contract}\0${account}` -> decoded row
  for (const item of dc.changes) {
    if (item.type !== 'data_update') continue;
    const d = decode(item.change);
    if (!d) continue;
    lastWrite.set(`${d.contract}\0${d.account}`, d);
  }
  const byContract = new Map();
  for (const d of lastWrite.values()) {
    if (!byContract.has(d.contract)) byContract.set(d.contract, []);
    byContract.get(d.contract).push(d);
  }
  return byContract;
}

async function main() {
  const arg = Number(process.argv[2]);
  const status = await rpc('status', []);
  const head = status.sync_info.latest_block_height;
  console.log(`RPC ${RPC_URL}\nchain head ${head}`);

  // Single explicit height if given; otherwise scan back from head until we have
  // FT-shaped slots from a few distinct contracts (a single block is often empty).
  let height,
    byContract = new Map();
  if (Number.isFinite(arg) && arg > 0) {
    height = arg;
    byContract = await decodeBlock(height);
  } else {
    for (let h = head - 5; h > head - 80 && byContract.size < 4; h--) {
      const b = await decodeBlock(h);
      if (b.size) {
        height = h;
        byContract = b;
      }
    }
  }
  if (!byContract.size)
    return console.log(
      'no FT-shaped data_update slots found; pass a busier block height as arg.',
    );
  console.log(
    `block ${height}: ${byContract.size} contracts produced FT-balance-shaped data_update slots\n`,
  );

  // Verify each decoded balance against ft_balance_of at the SAME block. A slot can be
  // FT-SHAPED without being a real NEP-141 (DEX/router internal maps) — ft_balance_of
  // returns null for those (non-FT), which is the calibration signal, not a mismatch.
  let ok = 0,
    checked = 0,
    nonFt = 0;
  for (const [contract, rows] of [...byContract]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 12)) {
    let cOk = 0,
      cChecked = 0,
      cNon = 0;
    for (const r of rows.slice(0, 4)) {
      const onchain = await ftBalanceOf(contract, r.account, height);
      if (onchain === null) {
        cNon++;
        continue;
      }
      cChecked++;
      const match = onchain === r.balance;
      if (match) cOk++;
      console.log(
        `${match ? 'MATCH' : 'DIFF '} ${contract}  ${r.account}  decoded=${
          r.balance
        }  rpc=${onchain}`,
      );
    }
    if (cChecked) console.log(`   -> ${contract}: ${cOk}/${cChecked}`);
    else if (cNon)
      console.log(
        `NONFT ${contract}: FT-shaped slot but no NEP-141 ft_balance_of (needs per-contract calibration)`,
      );
    ok += cOk;
    checked += cChecked;
    nonFt += cNon ? 1 : 0;
  }
  console.log(
    `\nTOTAL: ${ok}/${checked} decoded balances exactly matched ft_balance_of at block ${height}` +
      (nonFt
        ? `; ${nonFt} contract(s) produced FT-shaped-but-non-NEP-141 slots (calibration filters these)`
        : ''),
  );
}

main().catch((e) => {
  console.error('\n' + e.message);
  process.exit(1);
});
