import * as bitcoin from 'bitcoinjs-lib';

import { Network } from 'nb-types';

import config from '#config';
import { generateCompressedPublicKey } from '#libs/kdf';

const network =
  config.network === Network.MAINNET
    ? bitcoin.networks.bitcoin
    : bitcoin.networks.testnet;

const deriveAddress = async (accountId: string, derivationPath: string) => {
  const derivedKey = await generateCompressedPublicKey(
    accountId,
    derivationPath,
  );

  const publicKeyBuffer = Buffer.from(derivedKey, 'hex');

  // Use P2WPKH (Bech32) address type
  const { address } = bitcoin.payments.p2wpkh({
    network,
    pubkey: publicKeyBuffer,
  });

  if (!address) {
    throw new Error('Failed to generate Bitcoin address');
  }

  return { address, publicKey: derivedKey };
};

export default deriveAddress;
