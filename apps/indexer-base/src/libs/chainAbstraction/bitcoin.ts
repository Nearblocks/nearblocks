import crypto from 'node:crypto';

import bs58check from 'bs58check';
import hash from 'hash.js';

import {
  deriveChildPublicKey,
  najPublicKeyStrToUncompressedHexPoint,
} from '#libs/chainAbstraction/utils';

// Derive the Bitcoin address from uncompressed public key
async function uncompressedHexPointToBtcAddress(
  publicKeyHex: string,
  network: string,
) {
  // Step 1: SHA-256 hashing of the public key
  const publicKeyBytes = Buffer.from(publicKeyHex, 'hex');
  const sha256HashOutput = await crypto.subtle.digest(
    'SHA-256',
    publicKeyBytes,
  );

  // Step 2: Convert ArrayBuffer to Uint8Array for hash.js
  const sha256Uint8Array = new Uint8Array(sha256HashOutput);

  // Step 3: RIPEMD-160 hashing on the result of SHA-256
  const ripemd160 = hash.ripemd160().update(sha256Uint8Array).digest();

  // Step 4: Adding network byte (0x00 for Bitcoin Mainnet, 0x6f for Testnet)
  const network_byte = network === 'bitcoin' ? 0x00 : 0x6f;
  const networkByte = new Uint8Array([network_byte]);

  const ripemd160Uint8Array = new Uint8Array(ripemd160);

  // Combine the network byte with RIPEMD-160 hash
  const networkByteAndRipemd160 = new Uint8Array(
    networkByte.length + ripemd160Uint8Array.length,
  );

  networkByteAndRipemd160.set(networkByte);
  networkByteAndRipemd160.set(ripemd160Uint8Array, networkByte.length);

  // Step 5: Base58Check encoding to get the final Bitcoin address
  const address = bs58check.encode(networkByteAndRipemd160);

  return address;
}

export async function getBitcoinAddress(accountId: string, path: string) {
  // Convert the root NEAR public key to uncompressed format
  const parentPublicKey = najPublicKeyStrToUncompressedHexPoint();

  // Derive the child public key for the given account ID and path
  const derivedPublicKey = await deriveChildPublicKey(
    parentPublicKey,
    accountId,
    path,
  );

  // Convert the derived public key to an Bitcoin address
  const btcAddress = await uncompressedHexPointToBtcAddress(
    derivedPublicKey,
    'bitcoin',
  );

  return btcAddress;

  const btcTestnetAddress = await uncompressedHexPointToBtcAddress(
    derivedPublicKey,
    'testnet',
  );
  return btcTestnetAddress;
}
