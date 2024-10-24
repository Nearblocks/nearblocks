import elliptic from 'elliptic';
import { base_decode } from 'near-api-js/lib/utils/serialize.js';
const { ec: EC } = elliptic;
import jsSha3 from 'js-sha3';

import knex from '#libs/knex';
const { sha3_256 } = jsSha3;

const rootPublicKey =
  'secp256k1:4NfTiv3UsGahebgTaHyD9vF8KYKMBnfd6kh94mK6xv8fGBiJB8TBtFMP5WWXz6B89Ac1fbpzPwAvoyQebemHFwx3';

// Function to decode NEAR public key and return uncompressed hex
export function najPublicKeyStrToUncompressedHexPoint(): string {
  const res =
    '04' +
    Buffer.from(base_decode(rootPublicKey.split(':')[1])).toString('hex');
  return res;
}

// Derive the child public key using NEAR signer ID and path
export async function deriveChildPublicKey(
  parentUncompressedPublicKeyHex: string,
  signerId: string,
  path = '',
): Promise<string> {
  const ec = new EC('secp256k1');
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
}

// Check if the derived address already exists in the DB
export async function addressExists(signerId: string, chain: string) {
  const result = await knex('derived_addresses')
    .where({ account_id: signerId, chain: chain })
    .first();

  return result;
}
