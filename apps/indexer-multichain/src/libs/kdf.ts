import elliptic from 'elliptic';
import jsSha3 from 'js-sha3';
import { base_decode } from 'near-api-js/lib/utils/serialize.js';

import { Network } from 'nb-types';

import config from '#config';

const { ec: EC } = elliptic;
const { sha3_256 } = jsSha3;
const ec = new EC('secp256k1');

export const signer =
  config.network === Network.MAINNET
    ? {
        account: 'v1.signer',
        publicKey:
          'secp256k1:3tFRbMqmoa6AAALMrEFAYCEoHcqKxeW38YptwowBVBtXK1vo36HDbUWuR6EZmoK4JcH6HDkNMGGqP1ouV7VZUWya',
      }
    : {
        account: 'v1.signer-prod.testnet',
        publicKey:
          'secp256k1:4NfTiv3UsGahebgTaHyD9vF8KYKMBnfd6kh94mK6xv8fGBiJB8TBtFMP5WWXz6B89Ac1fbpzPwAvoyQebemHFwx3',
      };

export const signerUncompressedPublicKeyHex =
  '04' +
  Buffer.from(base_decode(signer.publicKey.split(':')[1])).toString('hex');

export const generateCompressedPublicKey = async (
  signerId: string,
  path: string,
): Promise<string> => {
  const derivedPublicKeyHex = await deriveChildPublicKey(
    signerUncompressedPublicKeyHex,
    signerId,
    path,
  );

  const publicKeyBuffer = Buffer.from(derivedPublicKeyHex, 'hex');

  // Compress the public key
  const compressedPublicKey = ec
    .keyFromPublic(publicKeyBuffer)
    .getPublic()
    .encodeCompressed();

  // Return the compressed public key as a hex string
  return Buffer.from(compressedPublicKey).toString('hex');
};

export const deriveChildPublicKey = async (
  parentUncompressedPublicKeyHex: string,
  signerId: string,
  path = '',
) => {
  const scalarHex = sha3_256(
    `near-mpc-recovery v0.1.0 epsilon derivation:${signerId},${path}`,
  );

  const x = parentUncompressedPublicKeyHex.substring(2, 66);
  const y = parentUncompressedPublicKeyHex.substring(66);

  // Create a point object from X and Y coordinates
  const oldPublicKeyPoint = ec.curve.point(x, y);

  // Multiply the scalar by the generator point G
  const scalarTimesG = ec.g.mul(scalarHex);

  // Add the result to the old public key point
  const newPublicKeyPoint = oldPublicKeyPoint.add(scalarTimesG);
  const newX = newPublicKeyPoint.getX().toString('hex').padStart(64, '0');
  const newY = newPublicKeyPoint.getY().toString('hex').padStart(64, '0');

  return '04' + newX + newY; // uncompressed public key
};
