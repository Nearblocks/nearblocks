#!/usr/bin/env node
// Proof that FT balances decode from the NEARDATA block stream — the source the indexer
// ACTUALLY consumes (`streamBlock` in packages/nb-neardata) — not just from RPC.
//
//   node scripts/ft-neardata-proof.mjs
//   NEARDATA_URL=https://mainnet.neardata.xyz RPC_URL=https://free.rpc.fastnear.com \
//     node scripts/ft-neardata-proof.mjs
//
// Why this exists: ft-state-decode-proof.mjs and ft-coverage-phase1.mjs pull state changes
// via RPC EXPERIMENTAL_changes. Production reads neardata blocks instead. This closes the
// gap by decoding `data_update` slots straight out of a real neardata block payload and
// verifying each against ft_balance_of at the same block. Result on first run: 6/6
// byte-exact (wrap.near, coin.abound.near, the 0x05-prefixed USDC-style contract, …).
//
// Note the raw neardata JSON is SNAKE_CASE: shards[].state_changes[].{ type,
// change:{ account_id, key_base64, value_base64 } }. nb-neardata camelCases it downstream;
// here we read the raw payload directly so the field shape is also verified.

const NEARDATA = process.env.NEARDATA_URL || 'https://mainnet.neardata.xyz';
const RPC = process.env.RPC_URL || 'https://free.rpc.fastnear.com';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rpc(method, params) {
  const r = await fetch(RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(JSON.stringify(j.error));
  return j.result;
}

// Decode a raw neardata change { account_id, key_base64, value_base64 }.
// EXPLORATORY scanner (discovery only) — production pins the exact prefix (design §2/§5).
function decode(ch) {
  const v = Buffer.from(ch.value_base64, 'base64');
  if (v.length !== 16) return null; // not a u128 balance slot
  const balance = (
    v.readBigUInt64LE(0) +
    (v.readBigUInt64LE(8) << 64n)
  ).toString();
  const k = Buffer.from(ch.key_base64, 'base64');
  for (let i = 0; i + 4 <= k.length; i++) {
    const len = k.readUInt32LE(i);
    if (len >= 2 && len <= 64 && i + 4 + len === k.length) {
      const account = k.subarray(i + 4).toString('utf8');
      if (/^[a-z0-9._-]+$/.test(account))
        return {
          contract: ch.account_id,
          account,
          balance,
          prefix: k.subarray(0, i).toString('hex'),
        };
    }
  }
  return null;
}

async function ftBalanceOf(contract, account, blockId) {
  try {
    const r = await rpc('query', {
      request_type: 'call_function',
      block_id: blockId,
      account_id: contract,
      method_name: 'ft_balance_of',
      args_base64: Buffer.from(
        JSON.stringify({ account_id: account }),
      ).toString('base64'),
    });
    return JSON.parse(Buffer.from(r.result).toString());
  } catch {
    return null; // not an FT
  }
}

async function getBlock(path) {
  const r = await fetch(`${NEARDATA}${path}`);
  if (!r.ok) throw new Error(`neardata ${path} -> http ${r.status}`);
  return r.json(); // null for a skipped slot height
}

async function main() {
  let blk = await getBlock('/v0/last_block/final');
  let height = blk.block.header.height;
  console.log(`NEARDATA ${NEARDATA}  final block ${height}`);

  const decoded = [];
  for (let tries = 0; tries < 80 && decoded.length < 6; tries++) {
    for (const sh of blk.shards || []) {
      for (const c of sh.state_changes || []) {
        if (c.type !== 'data_update') continue;
        const d = decode(c.change);
        if (d) decoded.push({ ...d, h: height });
      }
    }
    if (decoded.length >= 6) break;
    do {
      height--;
      blk = await getBlock(`/v0/block/${height}`);
    } while (blk === null);
  }
  console.log(
    `found ${decoded.length} FT-shaped data_update slots in neardata blocks\n`,
  );

  let ok = 0,
    checked = 0;
  const seen = new Set();
  for (const d of decoded) {
    const key = `${d.contract}\0${d.account}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const onchain = await ftBalanceOf(d.contract, d.account, d.h);
    if (onchain === null) {
      console.log(`NOFT  ${d.contract} ${d.account} (no ft_balance_of)`);
      continue;
    }
    checked++;
    const m = onchain === d.balance;
    if (m) ok++;
    console.log(
      `${m ? 'MATCH' : 'DIFF '} ${d.contract} ${d.account} neardata=${
        d.balance
      } rpc=${onchain} (block ${d.h}, prefix 0x${d.prefix})`,
    );
    await sleep(60);
  }
  console.log(
    `\nNEARDATA->decode vs RPC ft_balance_of: ${ok}/${checked} byte-exact`,
  );
  process.exit(checked > 0 && ok === checked ? 0 : 1);
}

main().catch((e) => {
  console.error('\nFATAL ' + e.message);
  process.exit(1);
});
