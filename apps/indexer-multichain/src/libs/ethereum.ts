import { keccak256 } from 'viem';

import {
  deriveChildPublicKey,
  signerUncompressedPublicKeyHex,
} from '#libs/kdf';

const deriveAddress = async (accountId: string, derivationPath: string) => {
  const publicKey = await deriveChildPublicKey(
    signerUncompressedPublicKeyHex,
    accountId,
    derivationPath,
  );
  const address = uncompressedHexPointToEvmAddress(publicKey);

  return { address, publicKey };
};

const uncompressedHexPointToEvmAddress = (uncompressedHexPoint: string) => {
  const addressHash = keccak256(`0x${uncompressedHexPoint.slice(2)}`);

  // Ethereum address is last 20 bytes of hash (40 characters), prefixed with 0x
  return '0x' + addressHash.substring(addressHash.length - 40);
};

export default deriveAddress;
