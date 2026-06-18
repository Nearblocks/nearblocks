#!/usr/bin/env node
// Offline self-test for the FT balance state-change decoder. NO NETWORK REQUIRED.
//
//   node scripts/ft-decode-selftest.mjs
//
// It encodes (account, balance) pairs EXACTLY the way near-contract-standards'
// FungibleToken does on-chain ( accounts: LookupMap<AccountId, Balance> ):
//     storage key   = <prefix bytes> ++ borsh(account_id) = <prefix> ++ <u32-LE len> ++ utf8
//     storage value = borsh(u128)    = 16 little-endian bytes
// then runs the SAME decoder used in scripts/ft-state-decode-proof.mjs and asserts
// round-trip correctness, plus the guard cases (non-u128 value, hashed/opaque key).
//
// This proves the byte-layout logic. The live mainnet check (decoded == ft_balance_of)
// lives in scripts/ft-state-decode-proof.mjs and needs egress to a NEAR RPC host.

import { createHash } from 'crypto';

const u32le = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; };
const borshString = (s) => Buffer.concat([u32le(Buffer.byteLength(s)), Buffer.from(s, 'utf8')]);
const borshU128 = (x) => { const b = Buffer.alloc(16); let v = BigInt(x); for (let i = 0; i < 16; i++) { b[i] = Number(v & 0xffn); v >>= 8n; } return b; };
const entry = (prefix, account, balance) => ({
  account_id: 'token.near',
  key_base64: Buffer.concat([Buffer.from(prefix), borshString(account)]).toString('base64'),
  value_base64: borshU128(balance).toString('base64'),
});

// --- decoder (identical to scripts/ft-state-decode-proof.mjs) ---
function decode(change) {
  const v = Buffer.from(change.value_base64, 'base64');
  if (v.length !== 16) return null;
  const balance = v.readBigUInt64LE(0) + (v.readBigUInt64LE(8) << 64n);
  const k = Buffer.from(change.key_base64, 'base64');
  for (let i = 0; i + 4 <= k.length; i++) {
    const len = k.readUInt32LE(i);
    if (len >= 2 && len <= 64 && i + 4 + len === k.length) {
      const account = k.subarray(i + 4).toString('utf8');
      if (/^[a-z0-9._-]+$/.test(account)) return { contract: change.account_id, account, balance: balance.toString() };
    }
  }
  return null;
}

const cases = [
  { prefix: [0x61], account: 'alice.near', balance: '1000000000000000000000000' },
  { prefix: [0x74], account: 'a.near', balance: '0' },
  { prefix: [0x00, 0x07], account: 'verylongaccountname-with-dashes_and.subaccounts.near', balance: '340282366920938463463374607431768211455' }, // u128 MAX
  { prefix: [0x05], account: 'usdt.tether-token.near', balance: '123456789' },
  { prefix: [0x0a, 0x00, 0x00, 0x00], account: 'edge.near', balance: '42' }, // prefix bytes look like a u32 length -> tests the scan
];

let pass = 0;
for (const t of cases) {
  const d = decode(entry(t.prefix, t.account, t.balance));
  const ok = !!d && d.account === t.account && d.balance === t.balance;
  console.log(`${ok ? 'PASS' : 'FAIL'}  prefix=[${t.prefix}]  acct=${t.account}  bal=${t.balance}`);
  if (!ok) console.log('      got:', d);
  if (ok) pass++;
}

const nonU128 = { account_id: 'token.near', key_base64: Buffer.concat([Buffer.from([0x53]), borshString('alice.near')]).toString('base64'), value_base64: Buffer.alloc(24).toString('base64') };
const hashedKey = { account_id: 'token.near', key_base64: Buffer.concat([Buffer.from([0x61]), createHash('sha256').update('alice.near').digest()]).toString('base64'), value_base64: borshU128('5').toString('base64') };
const g1 = decode(nonU128) === null;
const g2 = decode(hashedKey) === null;
console.log(`${g1 ? 'PASS' : 'FAIL'}  guard: 24-byte (non-u128) value skipped`);
console.log(`${g2 ? 'PASS' : 'FAIL'}  guard: hashed/opaque key skipped -> RPC fallback`);

const allOk = pass === cases.length && g1 && g2;
console.log(`\n${pass}/${cases.length} positive cases + ${(g1 ? 1 : 0) + (g2 ? 1 : 0)}/2 guards`);
process.exit(allOk ? 0 : 1);
