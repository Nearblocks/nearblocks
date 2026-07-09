import { sha3_256 } from '@noble/hashes/sha3';
import bs58 from 'bs58';

import { type BadgeVariant } from '@/ui/badge';

const ML_DSA_65_PREFIX = 'ml-dsa-65:';
const ML_DSA_65_HASH_PREFIX = 'ml-dsa-65-hash:';
const ED25519_PREFIX = 'ed25519:';
const SECP256K1_PREFIX = 'secp256k1:';

// Must stay in sync with the indexer: apps/indexer-accounts/src/libs/utils.ts
const ML_DSA_65_HASH_DOMAIN_TAG = 'near:ml-dsa-65-pubkey-hash:v1';

export type KeyAlgorithmId = 'ed25519' | 'ml-dsa-65' | 'secp256k1' | 'unknown';

export type KeyAlgorithm = {
  id: KeyAlgorithmId;
  label: string;
  postQuantum: boolean;
  tooltip?: string;
  variant: BadgeVariant;
};

/**
 * Classify a public key by its curve prefix. Both `ml-dsa-65:` (full key) and
 * `ml-dsa-65-hash:` (the canonical on-chain hash form) are post-quantum.
 * Unknown prefixes fall back to a verbatim label so we never hide information.
 */
export const keyAlgorithm = (publicKey: string): KeyAlgorithm => {
  if (
    publicKey.startsWith(ML_DSA_65_PREFIX) ||
    publicKey.startsWith(ML_DSA_65_HASH_PREFIX)
  ) {
    return {
      id: 'ml-dsa-65',
      label: 'ML-DSA-65',
      postQuantum: true,
      tooltip:
        'Post-quantum signature scheme (ML-DSA-65, FIPS-204). Resistant to attacks from quantum computers.',
      variant: 'purple',
    };
  }

  if (publicKey.startsWith(ED25519_PREFIX)) {
    return {
      id: 'ed25519',
      label: 'Ed25519',
      postQuantum: false,
      variant: 'blue',
    };
  }

  if (publicKey.startsWith(SECP256K1_PREFIX)) {
    return {
      id: 'secp256k1',
      label: 'Secp256k1',
      postQuantum: false,
      variant: 'gray',
    };
  }

  const [prefix] = publicKey.split(':');

  return {
    id: 'unknown',
    label: prefix || 'Unknown',
    postQuantum: false,
    variant: 'gray',
  };
};

export const isMlDsaFullKey = (publicKey: string): boolean =>
  publicKey.startsWith(ML_DSA_65_PREFIX);

/** True for the canonical on-chain post-quantum key form `ml-dsa-65-hash:…`. */
export const isMlDsaHashKey = (publicKey: string): boolean =>
  publicKey.startsWith(ML_DSA_65_HASH_PREFIX);

/**
 * Reduce a full `ml-dsa-65:<~2,600 chars>` key to its canonical on-chain
 * `ml-dsa-65-hash:<base58>` form, matching the indexer's normalizePublicKey so
 * the value shown here equals the account Keys tab and `view_access_key_list`.
 * Any other key (or a malformed one) is returned unchanged.
 */
export const normalizePublicKey = (publicKey: string): string => {
  if (!isMlDsaFullKey(publicKey)) {
    return publicKey;
  }

  try {
    const raw = bs58.decode(publicKey.slice(ML_DSA_65_PREFIX.length));
    const tag = new TextEncoder().encode(ML_DSA_65_HASH_DOMAIN_TAG);
    const input = new Uint8Array(tag.length + raw.length);
    input.set(tag, 0);
    input.set(raw, tag.length);

    return `${ML_DSA_65_HASH_PREFIX}${bs58.encode(sha3_256(input))}`;
  } catch {
    return publicKey;
  }
};
