import crypto from 'node:crypto';

import bs58check from 'bs58check';
import hash from 'hash.js';

import { Network } from 'nb-types';

import config from '#config';
import {
  deriveChildPublicKey,
  najPublicKeyStrToUncompressedHexPoint,
} from '#libs/kdf';

const network = config.network === Network.MAINNET ? 'bitcoin' : 'testnet';

const deriveAddress = async (accountId: string, derivation_path: string) => {
  const publicKey = await deriveChildPublicKey(
    najPublicKeyStrToUncompressedHexPoint(),
    accountId,
    derivation_path,
  );
  const address = await uncompressedHexPointToBtcAddress(publicKey, network);

  return { address, publicKey };
};

const uncompressedHexPointToBtcAddress = async (
  publicKeyHex: string,
  network: string,
) => {
  // Step 1: SHA-256 hashing of the public key
  const publicKeyBytes = Uint8Array.from(Buffer.from(publicKeyHex, 'hex'));

  const sha256HashOutput = await crypto.subtle.digest(
    'SHA-256',
    publicKeyBytes,
  );

  // Step 2: RIPEMD-160 hashing on the result of SHA-256
  const ripemd160 = hash
    .ripemd160()
    .update(Buffer.from(sha256HashOutput))
    .digest();

  // Step 3: Adding network byte (0x00 for Bitcoin Mainnet)
  const network_byte = network === 'bitcoin' ? 0x00 : 0x6f;
  const networkByte = Buffer.from([network_byte]);
  const networkByteAndRipemd160 = Buffer.concat([
    networkByte,
    Buffer.from(ripemd160),
  ]);

  // Step 4: Base58Check encoding
  const address = bs58check.encode(networkByteAndRipemd160);

  return address;
};

export default deriveAddress;
