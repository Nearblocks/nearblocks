import { createHash } from 'node:crypto';

import { ed25519 } from '@noble/curves/ed25519.js';
import bs58 from 'bs58';

const METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
const PDA_MARKER = new TextEncoder().encode('ProgramDerivedAddress');

export const findMetadataPda = (mint: string): string => {
  const programId = bs58.decode(METADATA_PROGRAM_ID);
  const seeds = [
    new TextEncoder().encode('metadata'),
    programId,
    bs58.decode(mint),
  ];

  for (let bump = 255; bump >= 0; bump--) {
    const buffer = Buffer.concat([
      ...seeds,
      Buffer.from([bump]),
      programId,
      PDA_MARKER,
    ]);
    const candidate = createHash('sha256').update(buffer).digest();

    if (!ed25519.utils.isValidPublicKey(candidate)) {
      return bs58.encode(candidate);
    }
  }

  throw new Error(`unable to find metadata pda for ${mint}`);
};

export const parseSymbol = (base64Data: string): null | string => {
  try {
    const data = Buffer.from(base64Data, 'base64');
    let offset = 1 + 32 + 32;
    const nameLen = data.readUInt32LE(offset);

    offset += 4 + nameLen;

    const symbolLen = data.readUInt32LE(offset);

    offset += 4;

    const symbol = data
      .subarray(offset, offset + symbolLen)
      .toString('utf8')
      .replace(/\0/g, '')
      .trim();

    return symbol || null;
  } catch {
    return null;
  }
};
