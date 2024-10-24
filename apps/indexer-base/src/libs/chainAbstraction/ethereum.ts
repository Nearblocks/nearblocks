import { keccak256 } from 'viem';

import {
  deriveChildPublicKey,
  najPublicKeyStrToUncompressedHexPoint,
} from '#libs/chainAbstraction/utils';

// Convert the uncompressed public key to an Ethereum address
function uncompressedHexPointToEvmAddress(
  uncompressedHexPoint: string,
): string {
  const addressHash = keccak256(`0x${uncompressedHexPoint.slice(2)}`);
  // Ethereum address is last 20 bytes of hash (40 characters), prefixed with 0x
  return '0x' + addressHash.substring(addressHash.length - 40);
}

export async function getEthereumAddress(
  accountId: string,
  path: string,
): Promise<string> {
  // Convert the root NEAR public key to uncompressed format
  const parentPublicKey = najPublicKeyStrToUncompressedHexPoint();

  // Derive the child public key for the given account ID and path
  const derivedPublicKey = await deriveChildPublicKey(
    parentPublicKey,
    accountId,
    path,
  );

  // Convert the derived public key to an Ethereum address
  const ethereumAddress = uncompressedHexPointToEvmAddress(derivedPublicKey);

  return ethereumAddress;
}
