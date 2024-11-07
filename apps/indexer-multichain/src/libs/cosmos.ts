import { ripemd160, Secp256k1, sha256 } from '@cosmjs/crypto';
import { fromHex } from '@cosmjs/encoding';
import { bech32 } from 'bech32';

import { generateCompressedPublicKey } from './kdf.js';

// implementation is pending becuase prefix is required for cosmos
const deriveAddress = async (
  accountId: string,
  derivationPath: string,
  prefix: string,
) => {
  const derivedKeyHex = await generateCompressedPublicKey(
    accountId,
    derivationPath,
  );

  const publicKey = fromHex(derivedKeyHex);
  const address = pubkeyToAddress(publicKey, prefix);

  return { address, publicKey: derivedKeyHex };
};

const pubkeyToAddress = (pubkey: Uint8Array, prefix: string) => {
  const pubkeyRaw =
    pubkey.length === 33 ? pubkey : Secp256k1.compressPubkey(pubkey);
  const sha256Hash = sha256(pubkeyRaw);
  const ripemd160Hash = ripemd160(sha256Hash);

  return bech32.encode(prefix, bech32.toWords(ripemd160Hash));
};

export default deriveAddress;
