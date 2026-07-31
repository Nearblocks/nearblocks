import { ed25519 } from '@noble/curves/ed25519.js';
import bs58 from 'bs58';
import elliptic from 'elliptic';
import jsSha3 from 'js-sha3';
import { providers } from 'near-api-js';

import { logger } from 'nb-logger';
import { Network } from 'nb-types';

import config from '#config';
import sentry from '#libs/sentry';

const { ec: EC } = elliptic;
const { sha3_256 } = jsSha3;

export const SECP256K1_DOMAIN_ID = 0;
export const ED25519_DOMAIN_ID = 1;

const EPSILON_PREFIX = 'near-mpc-recovery v0.1.0 epsilon derivation:';

const MPC_CONTRACT: Record<Network, string> = {
  [Network.MAINNET]: 'v1.signer',
  [Network.TESTNET]: 'v1.signer-prod.testnet',
};

const secp256k1 = new EC('secp256k1');

type MpcDomainEntry = {
  domain_id: number;
  key:
    | {
        Ed25519: {
          edwards_point: number[];
          near_public_key_compressed: string;
        };
      }
    | { Bls12381: unknown }
    | { Secp256k1: { near_public_key: string } };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RootPoint = any;

export type RootKeys = {
  ed25519: RootPoint;
  secp256k1: RootPoint;
};

let rootKeys: null | RootKeys = null;

const epsilon = (predecessor: string, path: string): Buffer =>
  Buffer.from(sha3_256.arrayBuffer(`${EPSILON_PREFIX}${predecessor},${path}`));

export const deriveSecp256k1Key = (
  root: RootPoint,
  predecessor: string,
  path: string,
): string => {
  const scalarHex = epsilon(predecessor, path).toString('hex');
  const point = root.add(secp256k1.g.mul(scalarHex));
  const x = point.getX().toString('hex').padStart(64, '0');
  const y = point.getY().toString('hex').padStart(64, '0');

  return `secp256k1:${bs58.encode(Buffer.from(x + y, 'hex'))}`;
};

export const deriveEd25519Key = (
  root: RootPoint,
  predecessor: string,
  path: string,
): string => {
  const digest = epsilon(predecessor, path);
  const scalar =
    BigInt(`0x${Buffer.from(digest).reverse().toString('hex')}`) %
    ed25519.Point.CURVE().n;
  const point = root.add(ed25519.Point.BASE.multiply(scalar));

  return `ed25519:${bs58.encode(point.toBytes())}`;
};

export const deriveKey = (
  domainId: number,
  roots: RootKeys,
  predecessor: string,
  path: string,
): string =>
  domainId === SECP256K1_DOMAIN_ID
    ? deriveSecp256k1Key(roots.secp256k1, predecessor, path)
    : deriveEd25519Key(roots.ed25519, predecessor, path);

export const initRootKeys = async (): Promise<void> => {
  const provider = new providers.JsonRpcProvider({ url: config.rpcUrl });
  const contract = MPC_CONTRACT[config.network];
  const args = Buffer.from(JSON.stringify({})).toString('base64');

  const response = await provider.query<{
    block_hash: string;
    block_height: number;
    result: number[];
  }>({
    account_id: contract,
    args_base64: args,
    finality: 'final',
    method_name: 'state',
    request_type: 'call_function',
  });

  const state = JSON.parse(Buffer.from(response.result).toString()) as Record<
    string,
    { keyset?: { domains?: MpcDomainEntry[] } }
  >;

  const domains = Object.values(state)[0]?.keyset?.domains;

  if (!Array.isArray(domains)) {
    throw new Error(`mpc: unexpected ${contract}.state() shape`);
  }

  const secp256k1Entry = domains.find(
    (domain) => domain.domain_id === SECP256K1_DOMAIN_ID,
  );
  const ed25519Entry = domains.find(
    (domain) => domain.domain_id === ED25519_DOMAIN_ID,
  );

  if (!secp256k1Entry || !('Secp256k1' in secp256k1Entry.key)) {
    throw new Error(
      `mpc: domain ${SECP256K1_DOMAIN_ID} missing or not Secp256k1`,
    );
  }

  if (!ed25519Entry || !('Ed25519' in ed25519Entry.key)) {
    throw new Error(`mpc: domain ${ED25519_DOMAIN_ID} missing or not Ed25519`);
  }

  const secp256k1Raw = bs58.decode(
    secp256k1Entry.key.Secp256k1.near_public_key.split(':')[1],
  );

  if (secp256k1Raw.length !== 64) {
    throw new Error('mpc: unexpected secp256k1 root key length');
  }

  const secp256k1Root = secp256k1.curve.point(
    Buffer.from(secp256k1Raw.subarray(0, 32)).toString('hex'),
    Buffer.from(secp256k1Raw.subarray(32)).toString('hex'),
  );

  const ed25519Root = ed25519.Point.fromHex(
    Buffer.from(ed25519Entry.key.Ed25519.edwards_point).toString('hex'),
  );

  rootKeys = { ed25519: ed25519Root, secp256k1: secp256k1Root };
};

export const getRootKeys = (): RootKeys => {
  if (!rootKeys) {
    throw new Error('mpc: root keys not initialized');
  }

  return rootKeys;
};

let refreshTimer: NodeJS.Timeout | null = null;

export const startRootKeysRefresh = (intervalMs = 3_600_000): void => {
  refreshTimer = setInterval(() => {
    initRootKeys().catch((error) => {
      logger.error('mpc: root key refresh failed, keeping last-known keys');
      logger.error(error);
      sentry.captureException(error);
    });
  }, intervalMs);

  refreshTimer.unref();
};

export const stopRootKeysRefresh = (): void => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};
