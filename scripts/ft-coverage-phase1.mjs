#!/usr/bin/env node
// Phase-1 measurement for the FT state-decode design (docs/ft-balance-design.md §11/§14).
//
//   node scripts/ft-coverage-phase1.mjs [numBlocks] [contract,contract,...]
//   RPC_URL=https://your-archival-rpc node scripts/ft-coverage-phase1.mjs 600
//
// Answers the questions the design says must be settled before any write path:
//
//  1. THE C1 GATE — sibling-map corruption. For each contract, group EVERY 16-byte
//     (u128-shaped) account-keyed data_update by its KEY PREFIX, then diff each prefix
//     against ft_balance_of. A contract is SAFE only if exactly ONE prefix is the balance
//     map (all samples match) and no OTHER account-keyed u128 prefix exists. A second
//     account-keyed u128 prefix (staking/locked/allowance) is the C1 risk made concrete —
//     it proves a prefix-agnostic decoder would corrupt balances, and yields the prefix
//     the production decoder must pin.
//  2. Coverage by volume — share of 16-byte account-keyed slots that decode as a real
//     balance (matches ft_balance_of) vs the non-standard / FT-shaped-but-not-FT tail.
//  3. Multi-write frequency (C2) — how often one (contract, account) is written more than
//     once in a single block (the case where "last write" matters).
//
// LIMITATION (stated honestly): public RPC refuses unbounded `view_state`
// (TOO_LARGE_CONTRACT_STATE), so we cannot enumerate a contract's FULL state — we observe
// only prefixes that were WRITTEN during the scan window. A sibling map touched only by
// rare actions outside the window won't appear, so a clean result is "no sibling map seen
// in N blocks", not a proof of absence. Use a long window and high-volume contracts to
// minimize false all-clears; an archival node + per-prefix view_state paging would close
// the gap entirely (see design §8b/M1).

const RPC_URL = process.env.RPC_URL || 'https://free.rpc.fastnear.com';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rpc(method, params, tries = 4) {
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
      lastErr = new Error(`network: ${e.message}`);
      await sleep(250);
      continue;
    }
    const text = await res.text();
    let j;
    try {
      j = JSON.parse(text);
    } catch {
      lastErr = new Error(
        `non-JSON (http ${res.status}): ${text.slice(0, 120)}`,
      );
      await sleep(250);
      continue;
    }
    if (j.error) {
      const msg = JSON.stringify(j.error);
      if (
        msg.includes('429') ||
        msg.includes('DEPRECATED') ||
        msg.includes('Timeout')
      ) {
        lastErr = new Error(msg);
        await sleep(300);
        continue;
      }
      throw new Error(`rpc ${method}: ${msg}`);
    }
    return j.result;
  }
  throw lastErr;
}

// Parse a balance-shaped slot into { prefixHex, account, balance }, or null.
// Same layout as the proof: value = 16-byte LE u128; key = <prefix> ++ <u32-LE len> ++ utf8.
// We additionally CAPTURE the prefix (bytes before the length) — that's the whole point.
function parseSlot(change) {
  const v = Buffer.from(change.value_base64, 'base64');
  if (v.length !== 16) return null;
  const balance = (
    v.readBigUInt64LE(0) +
    (v.readBigUInt64LE(8) << 64n)
  ).toString();
  const k = Buffer.from(change.key_base64, 'base64');
  for (let i = 0; i + 4 <= k.length; i++) {
    const len = k.readUInt32LE(i);
    if (len >= 2 && len <= 64 && i + 4 + len === k.length) {
      const account = k.subarray(i + 4).toString('utf8');
      if (/^[a-z0-9._-]+$/.test(account)) {
        return {
          prefixHex: k.subarray(0, i).toString('hex'),
          account,
          balance,
        };
      }
    }
  }
  return null;
}

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
    if (
      /Method|cannot find|doesn't exist|panic|deserialize|invalid|FunctionCall/i.test(
        e.message,
      )
    )
      return { kind: 'not_ft' };
    if (/UNKNOWN_BLOCK|garbage|DB Not Found|MISSING_TRIE/i.test(e.message))
      return { kind: 'gc' }; // historical state GC'd (non-archival) — H3
    return { kind: 'err', message: e.message };
  }
  if (!r || !Array.isArray(r.result)) return { kind: 'not_ft' };
  return { kind: 'ok', balance: JSON.parse(Buffer.from(r.result).toString()) };
}

async function main() {
  const numBlocks = Number(process.argv[2]) || 400;
  const onlyContracts = process.argv[3]
    ? new Set(process.argv[3].split(','))
    : null;
  const status = await rpc('status', []);
  const head = status.sync_info.latest_block_height;
  const start = head - 5;
  console.log(`RPC ${RPC_URL}`);
  console.log(
    `scanning ${numBlocks} blocks (${start} .. ${start - numBlocks + 1})` +
      (onlyContracts
        ? `, contracts: ${[...onlyContracts].join(', ')}`
        : ', all contracts') +
      '\n',
  );

  // contract -> prefixHex -> { accounts: Map(account -> {balance, block}), writes }
  const byContractPrefix = new Map();
  let totalSlots16 = 0,
    parsedSlots = 0,
    scanned = 0,
    multiWriteEvents = 0;

  for (let h = start; h > start - numBlocks; h--) {
    let inBlock;
    try {
      inBlock = await rpc('EXPERIMENTAL_changes_in_block', { block_id: h });
    } catch {
      continue;
    }
    scanned++;
    let touched = [
      ...new Set(
        inBlock.changes
          .filter((c) => c.type === 'data_touched')
          .map((c) => c.account_id),
      ),
    ];
    if (onlyContracts) touched = touched.filter((c) => onlyContracts.has(c));
    if (!touched.length) continue;
    // pull data changes in capped batches to keep responses small
    for (let off = 0; off < touched.length; off += 60) {
      let dc;
      try {
        dc = await rpc('EXPERIMENTAL_changes', {
          changes_type: 'data_changes',
          account_ids: touched.slice(off, off + 60),
          key_prefix_base64: '',
          block_id: h,
        });
      } catch {
        continue;
      }
      const perBlockKey = new Map(); // detect multi-write within this block
      for (const item of dc.changes) {
        if (item.type !== 'data_update') continue;
        const v = Buffer.from(item.change.value_base64, 'base64');
        if (v.length === 16) totalSlots16++;
        const d = parseSlot(item.change);
        if (!d) continue;
        parsedSlots++;
        const contract = item.change.account_id;
        const mwk = `${contract}\0${d.account}`;
        perBlockKey.set(mwk, (perBlockKey.get(mwk) || 0) + 1);
        if (!byContractPrefix.has(contract))
          byContractPrefix.set(contract, new Map());
        const pm = byContractPrefix.get(contract);
        if (!pm.has(d.prefixHex))
          pm.set(d.prefixHex, { accounts: new Map(), writes: 0 });
        const slot = pm.get(d.prefixHex);
        slot.writes++;
        slot.accounts.set(d.account, { balance: d.balance, block: h }); // last write wins
      }
      for (const n of perBlockKey.values()) if (n > 1) multiWriteEvents++;
    }
    await sleep(20);
  }

  console.log(
    `scanned ${scanned} blocks; ${totalSlots16} u128-shaped data_update slots; ` +
      `${parsedSlots} account-keyed; ${byContractPrefix.size} distinct contracts; ` +
      `${multiWriteEvents} multi-write (same account twice in a block)\n`,
  );

  // Verify each (contract, prefix) against ft_balance_of. Rank contracts by activity.
  const ranked = [...byContractPrefix].sort((a, b) => {
    const av = [...a[1].values()].reduce((s, x) => s + x.writes, 0);
    const bv = [...b[1].values()].reduce((s, x) => s + x.writes, 0);
    return bv - av;
  });
  const SAMPLE = 5;
  const flagged = [];
  for (const [contract, prefixes] of ranked.slice(0, 25)) {
    console.log(
      `### ${contract}  (${prefixes.size} account-keyed u128 prefix${
        prefixes.size > 1 ? 'es' : ''
      })`,
    );
    let balancePrefixes = 0,
      siblingPrefixes = 0;
    for (const [prefixHex, slot] of [...prefixes].sort(
      (a, b) => b[1].writes - a[1].writes,
    )) {
      const accts = [...slot.accounts].slice(0, SAMPLE);
      let ok = 0,
        diff = 0,
        notFt = 0,
        gc = 0,
        err = 0,
        sampleErr = '';
      for (const [account, info] of accts) {
        let res = await ftBalanceOf(contract, account, info.block);
        if (res.kind === 'err') {
          await sleep(400);
          res = await ftBalanceOf(contract, account, info.block);
        } // one hard retry
        if (res.kind === 'ok') res.balance === info.balance ? ok++ : diff++;
        else if (res.kind === 'not_ft') notFt++;
        else if (res.kind === 'gc') gc++;
        else {
          err++;
          sampleErr ||= res.message || '';
        }
        await sleep(40);
      }
      const total = accts.length;
      let label;
      if (ok === total && ok > 0) {
        label = 'BALANCE (all match)';
        balancePrefixes++;
      } else if (ok > 0 && diff > 0)
        label = 'MIXED (some match!) — investigate';
      else if (notFt === total) label = 'not-an-FT (no ft_balance_of)';
      else if (diff === total) {
        label = 'SIBLING? account-keyed u128, none match ft_balance_of';
        siblingPrefixes++;
      } else if (gc)
        label = `inconclusive (${gc} historical state GC'd — needs archival)`;
      else
        label = `mixed: ok=${ok} diff=${diff} notFt=${notFt} gc=${gc} err=${err}`;
      console.log(
        `   prefix=0x${prefixHex || '(empty)'}  writes=${slot.writes} accts=${
          slot.accounts.size
        }  -> ${label}`,
      );
    }
    // C1 verdict for this contract
    if (balancePrefixes >= 1 && prefixes.size - balancePrefixes >= 1) {
      const note = `${contract}: ${balancePrefixes} balance + ${
        prefixes.size - balancePrefixes
      } other account-keyed u128 prefix(es) -> prefix-pinning REQUIRED`;
      flagged.push(note);
      console.log(`   ⚠️  ${note}`);
    } else if (balancePrefixes > 1) {
      flagged.push(
        `${contract}: ${balancePrefixes} prefixes all match ft_balance_of — unexpected, investigate`,
      );
    }
    console.log('');
  }

  console.log('================ SUMMARY ================');
  console.log(`blocks scanned: ${scanned}`);
  console.log(
    `coverage: ${parsedSlots}/${totalSlots16} u128 slots are account-keyed (${(
      (100 * parsedSlots) /
      Math.max(1, totalSlots16)
    ).toFixed(1)}%)`,
  );
  console.log(`multi-write events (C2): ${multiWriteEvents}`);
  console.log(
    `contracts with >1 account-keyed u128 prefix (C1 evidence): ${flagged.length}`,
  );
  for (const f of flagged) console.log(`  - ${f}`);
  console.log(
    '\nNOTE: a clean result means "no sibling map written in this window", not proof',
  );
  console.log(
    'of absence. Re-run with a longer window / known contract list for confidence.',
  );
}

main().catch((e) => {
  console.error('\nFATAL ' + e.message);
  process.exit(1);
});
