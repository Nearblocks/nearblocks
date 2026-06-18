#!/usr/bin/env node
// Live proof: decode FT balances directly from on-chain STATE CHANGES and verify
// each decoded value against ft_balance_of at the same block.
//
// Needs egress to ONE NEAR RPC host that supports EXPERIMENTAL_changes*.
// Usage:
//   RPC_URL=https://rpc.mainnet.near.org node scripts/ft-state-decode-proof.mjs [blockHeight]
//
// Proves: the value in a `data_update` state change == the contract's real balance
// (same number ft_balance_of returns) — i.e. balances can be read from blocks we
// already ingest, with no dependence on NEP-141 events and no per-read RPC.

const RPC_URL = process.env.RPC_URL || 'https://rpc.mainnet.near.org';

async function rpc(method, params) {
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
    throw new Error(`EGRESS BLOCKED — add "${host}" to this environment's network allowlist (and start a fresh web session if it was just changed).\n  proxy said: ${text.trim()}`);
  }
  let j;
  try { j = JSON.parse(text); } catch { throw new Error(`non-JSON from ${RPC_URL} (http ${res.status}): ${text.slice(0, 200)}`); }
  if (j.error) throw new Error(`rpc ${method}: ${JSON.stringify(j.error)}`);
  return j.result;
}

// near-contract-standards FungibleToken: accounts: LookupMap<AccountId, Balance>
//   key   = <prefix bytes> ++ borsh(account_id) = <prefix> ++ <u32-LE len> ++ utf8
//   value = borsh(u128) = 16 little-endian bytes
function decode(change) {
  const v = Buffer.from(change.value_base64, 'base64');
  if (v.length !== 16) return null;                                      // not a u128 balance slot
  const balance = v.readBigUInt64LE(0) + (v.readBigUInt64LE(8) << 64n);  // u128 LE
  const k = Buffer.from(change.key_base64, 'base64');
  for (let i = 0; i + 4 <= k.length; i++) {                              // find <prefix><u32 len><utf8 acct>
    const len = k.readUInt32LE(i);
    if (len >= 2 && len <= 64 && i + 4 + len === k.length) {
      const account = k.subarray(i + 4).toString('utf8');
      if (/^[a-z0-9._-]+$/.test(account)) return { contract: change.account_id, account, balance: balance.toString() };
    }
  }
  return null;                                                           // non-standard layout -> RPC fallback
}

async function ftBalanceOf(contract, account, blockId) {
  try {
    const r = await rpc('query', {
      request_type: 'call_function',
      block_id: blockId,
      account_id: contract,
      method_name: 'ft_balance_of',
      args_base64: Buffer.from(JSON.stringify({ account_id: account })).toString('base64'),
    });
    return JSON.parse(Buffer.from(r.result).toString());
  } catch {
    return null; // contract has no ft_balance_of -> not an FT, filtered out
  }
}

async function main() {
  const arg = Number(process.argv[2]);
  const status = await rpc('status', []);
  const head = status.sync_info.latest_block_height;
  const height = Number.isFinite(arg) && arg > 0 ? arg : head - 30;
  console.log(`RPC ${RPC_URL}\nchain head ${head}; inspecting block ${height}\n`);

  // 1) which contracts had storage (data) changes in this block
  const inBlock = await rpc('EXPERIMENTAL_changes_in_block', { block_id: height });
  const touched = [...new Set(inBlock.changes.filter((c) => c.type === 'data_touched').map((c) => c.account_id))];
  console.log(`${touched.length} contracts had data changes in block ${height}`);
  if (!touched.length) return console.log('no data changes at this height; pass another height as arg.');

  // 2) pull the actual key/value data changes (cap the account set to keep the response small)
  const dc = await rpc('EXPERIMENTAL_changes', {
    changes_type: 'data_changes',
    account_ids: touched.slice(0, 60),
    key_prefix_base64: '',
    block_id: height,
  });

  // 3) decode FT-balance-shaped slots (u128 value + readable account in key)
  const byContract = new Map();
  for (const item of dc.changes) {
    if (item.type !== 'data_update') continue;
    const d = decode(item.change);
    if (!d) continue;
    (byContract.get(d.contract) ?? byContract.set(d.contract, []).get(d.contract)).push(d);
  }
  console.log(`${byContract.size} contracts produced FT-balance-shaped data_update slots\n`);

  // 4) verify each decoded balance against ft_balance_of at the SAME block
  let ok = 0, checked = 0;
  for (const [contract, rows] of [...byContract].sort((a, b) => b[1].length - a[1].length).slice(0, 10)) {
    let cOk = 0, cChecked = 0;
    for (const r of rows.slice(0, 4)) {
      const onchain = await ftBalanceOf(contract, r.account, height);
      if (onchain === null) continue;
      cChecked++; const match = onchain === r.balance; if (match) cOk++;
      console.log(`${match ? 'MATCH' : 'DIFF '} ${contract}  ${r.account}  decoded=${r.balance}  rpc=${onchain}`);
    }
    if (cChecked) console.log(`   -> ${contract}: ${cOk}/${cChecked}\n`);
    ok += cOk; checked += cChecked;
  }
  console.log(`TOTAL: ${ok}/${checked} decoded balances exactly matched ft_balance_of at block ${height}`);
}

main().catch((e) => { console.error('\n' + e.message); process.exit(1); });
