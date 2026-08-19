import { logger } from 'nb-logger';
import { RPC } from 'nb-near';
import {
  decodeBorshString,
  decodeU128LE,
  decodeU128LEAt,
  readJsonPath,
  retry,
} from 'nb-utils';

import config from '#config';
import { fetchBalance } from '#services/verify';
import {
  Bucket,
  DataChange,
  InferredLayout,
  JsonLeaf,
  LayoutResult,
  LayoutSample,
  Observation,
  RpcErrorBody,
} from '#types/types';

const PROBE_RADIUS = 10;
const MAX_COMPETING_PREFIXES = 6;
const MAX_ACCOUNT_OFFSET = 8;
const MIN_INDEX_OBSERVATIONS = 2;
const INDEX_WIDTHS = [4, 8];
const MAX_JSON_ACCOUNTS = 3;
const MAX_JSON_DEPTH = 5;
const ASCII_INDEX = /[0-9]+$/;
const PRINTABLE_KEY = /^[\x20-\x7e]+$/;
const DIGITS = /^[0-9]+$/;
const ACCOUNT_ID = /^[a-z0-9._-]{2,64}$/;
const STATE_KEY = Buffer.from('STATE');

const describeRpcErrorBody = (data: unknown): string | undefined => {
  const body = data as RpcErrorBody | undefined;
  return body?.error?.cause?.name ?? body?.error?.data ?? body?.error?.message;
};

const dataChanges = async (
  rpc: RPC,
  contract: string,
  blockHeight: number,
): Promise<DataChange[]> => {
  let res;

  try {
    res = await retry(
      () =>
        rpc.query(
          {
            account_ids: [contract],
            block_id: blockHeight,
            changes_type: 'data_changes',
            key_prefix_base64: '',
          },
          'EXPERIMENTAL_changes',
        ),
      { exponential: true, retries: 5 },
    );
  } catch (error) {
    const body = (error as { response?: { data?: unknown } })?.response?.data;
    throw new Error(
      `${contract}: data_changes failed: ${
        describeRpcErrorBody(body) ?? String(error)
      }`,
    );
  }

  const changes = res.data?.result?.changes as
    | { change: { key_base64: string; value_base64?: string } }[]
    | undefined;

  if (!changes) {
    throw new Error(
      `${contract}: data_changes failed: ${
        describeRpcErrorBody(res.data) ?? 'no changes'
      }`,
    );
  }

  return changes
    .filter((entry) => entry.change.value_base64)
    .map((entry) => ({
      key: Buffer.from(entry.change.key_base64, 'base64'),
      value: Buffer.from(entry.change.value_base64 as string, 'base64'),
    }));
};

export const assertArchival = async (
  rpc: RPC,
  contract: string,
  blockHeight: number,
): Promise<void> => {
  try {
    await dataChanges(rpc, contract, blockHeight);
  } catch (error) {
    throw new Error(
      `RPC_URL must point at an archival node, reading block ${blockHeight} ` +
        `failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

const probeOrder = (blockHeight: number): number[] => {
  const order = [blockHeight];

  for (let step = 1; step <= PROBE_RADIUS; step++) {
    order.push(blockHeight - step, blockHeight + step);
  }

  return order.filter((height) => height > 0);
};

const keyObservation = (change: DataChange): null | Observation => {
  for (let prefixLen = 1; prefixLen + 4 < change.key.length; prefixLen++) {
    const declared = change.key.readUInt32LE(prefixLen);
    if (declared !== change.key.length - prefixLen - 4) continue;

    const account = change.key.subarray(prefixLen + 4).toString('utf8');
    if (!ACCOUNT_ID.test(account)) continue;

    return {
      account,
      accountEnd: null,
      accountOffset: null,
      accountPath: null,
      json: null,
      keyEncoding: 'borsh',
      prefix: change.key.subarray(0, prefixLen),
      value: change.value,
      valueEncoding: 'u128le',
    };
  }

  return null;
};

const valueObservations = (change: DataChange): Observation[] => {
  for (let offset = 0; offset <= MAX_ACCOUNT_OFFSET; offset++) {
    const decoded = decodeBorshString(change.value, offset);
    if (!decoded || !ACCOUNT_ID.test(decoded.text)) continue;

    return INDEX_WIDTHS.filter((width) => change.key.length > width).map(
      (width): Observation => ({
        account: decoded.text,
        accountEnd: decoded.end,
        accountOffset: offset,
        accountPath: null,
        json: null,
        keyEncoding: 'index',
        prefix: change.key.subarray(0, change.key.length - width),
        value: change.value,
        valueEncoding: 'u128le',
      }),
    );
  }

  return [];
};

const jsonLeaves = (
  node: unknown,
  path: string,
  depth: number,
  out: JsonLeaf[],
): void => {
  if (depth > MAX_JSON_DEPTH) return;

  if (typeof node === 'string' || typeof node === 'number') {
    if (path) out.push({ path, text: String(node) });
    return;
  }

  if (typeof node !== 'object' || node === null || Array.isArray(node)) return;

  for (const [field, child] of Object.entries(
    node as Record<string, unknown>,
  )) {
    jsonLeaves(child, path ? `${path}.${field}` : field, depth + 1, out);
  }
};

const parseJson = (value: Buffer): unknown => {
  try {
    return JSON.parse(value.toString('utf8'));
  } catch {
    return null;
  }
};

const leavesOf = (json: unknown): JsonLeaf[] => {
  const out: JsonLeaf[] = [];
  jsonLeaves(json, '', 0, out);

  return out;
};

const asAmount = (text: string): bigint | null =>
  DIGITS.test(text) ? BigInt(text) : null;

const jsonObservations = (change: DataChange): Observation[] => {
  const keyText = change.key.toString('utf8');
  if (!PRINTABLE_KEY.test(keyText)) return [];

  const prefixText = keyText.replace(ASCII_INDEX, '');
  if (prefixText === keyText || !prefixText) return [];

  const json = parseJson(change.value);
  if (typeof json !== 'object' || json === null) return [];

  return leavesOf(json)
    .filter((leaf) => ACCOUNT_ID.test(leaf.text))
    .sort((a, b) => Number(b.text.includes('.')) - Number(a.text.includes('.')))
    .slice(0, MAX_JSON_ACCOUNTS)
    .map(
      (leaf): Observation => ({
        account: leaf.text,
        accountEnd: null,
        accountOffset: null,
        accountPath: leaf.path,
        json,
        keyEncoding: 'index',
        prefix: Buffer.from(prefixText, 'utf8'),
        value: change.value,
        valueEncoding: 'json',
      }),
    );
};

const observe = (change: DataChange): Observation[] => {
  const fromKey = keyObservation(change);
  if (fromKey) return [fromKey];

  const fromValue = valueObservations(change);
  if (fromValue.length) return fromValue;

  return jsonObservations(change);
};

const amountAt = (observation: Observation, offset: number): bigint | null =>
  decodeU128LEAt(observation.value, (observation.accountEnd ?? 0) + offset);

const solveOffsets = async (
  rpc: RPC,
  contract: string,
  observations: Observation[],
  blockHeight: number,
): Promise<number[]> => {
  let solved: null | number[] = null;

  for (const observation of observations) {
    const balance = await fetchBalance(
      rpc,
      contract,
      observation.account,
      blockHeight,
    );

    if (balance === null || balance === 0n) continue;

    const matches: number[] = [];
    const base = observation.accountEnd ?? 0;

    for (
      let offset = 0;
      base + offset + 16 <= observation.value.length;
      offset++
    ) {
      if (amountAt(observation, offset) === balance) matches.push(offset);
    }

    solved =
      solved === null
        ? matches
        : solved.filter((offset) => matches.includes(offset));

    if (solved.length <= 1) return solved;
  }

  return solved ?? [];
};

const solveValuePaths = async (
  rpc: RPC,
  contract: string,
  observations: Observation[],
  blockHeight: number,
): Promise<string[]> => {
  let solved: null | string[] = null;

  for (const observation of observations) {
    const balance = await fetchBalance(
      rpc,
      contract,
      observation.account,
      blockHeight,
    );

    if (balance === null || balance === 0n) continue;

    const matches = leavesOf(observation.json)
      .filter((leaf) => asAmount(leaf.text) === balance)
      .map((leaf) => leaf.path);

    solved =
      solved === null
        ? matches
        : solved.filter((path) => matches.includes(path));

    if (solved.length <= 1) return solved;
  }

  return solved ?? [];
};

const buildJsonCandidate = async (
  rpc: RPC,
  contract: string,
  bucket: Bucket,
  blockHeight: number,
): Promise<InferredLayout | null> => {
  if (bucket.observations.length < MIN_INDEX_OBSERVATIONS) return null;

  const paths = await solveValuePaths(
    rpc,
    contract,
    bucket.observations,
    blockHeight,
  );

  if (paths.length !== 1) return null;

  const valuePath = paths[0] as string;
  const samples: LayoutSample[] = [];

  for (const observation of bucket.observations.slice(
    0,
    config.verifySamples,
  )) {
    const leaf = readJsonPath(observation.json, valuePath);
    const amount = typeof leaf === 'undefined' ? null : asAmount(String(leaf));

    if (amount !== null) samples.push({ account: observation.account, amount });
  }

  if (!samples.length) return null;

  return {
    accountOffset: null,
    accountPath: bucket.accountPath,
    blockHeight,
    keyEncoding: 'index',
    prefix: bucket.prefix,
    samples,
    valueEncoding: 'json',
    valueOffset: null,
    valuePath,
  };
};

const buildCandidate = async (
  rpc: RPC,
  contract: string,
  bucket: Bucket,
  blockHeight: number,
): Promise<InferredLayout | null> => {
  if (bucket.valueEncoding === 'json')
    return buildJsonCandidate(rpc, contract, bucket, blockHeight);

  const sized = bucket.observations.filter(
    (observation) => observation.value.length === 16,
  );

  if (bucket.keyEncoding === 'borsh' && sized.length) {
    return {
      accountOffset: null,
      accountPath: null,
      blockHeight,
      keyEncoding: 'borsh',
      prefix: bucket.prefix,
      samples: sized.slice(0, config.verifySamples).map(
        (observation): LayoutSample => ({
          account: observation.account,
          amount: decodeU128LE(observation.value),
        }),
      ),
      valueEncoding: 'u128le',
      valueOffset: null,
      valuePath: null,
    };
  }

  const accountOffset = bucket.observations[0]?.accountOffset ?? null;
  const observations = bucket.observations.filter(
    (observation) => observation.accountOffset === accountOffset,
  );

  if (
    bucket.keyEncoding === 'index' &&
    observations.length < MIN_INDEX_OBSERVATIONS
  ) {
    return null;
  }

  const offsets = await solveOffsets(rpc, contract, observations, blockHeight);

  if (offsets.length !== 1) return null;

  const valueOffset = offsets[0] as number;
  const samples: LayoutSample[] = [];

  for (const observation of observations.slice(0, config.verifySamples)) {
    const amount = amountAt(observation, valueOffset);
    if (amount !== null) samples.push({ account: observation.account, amount });
  }

  if (!samples.length) return null;

  return {
    accountOffset,
    accountPath: null,
    blockHeight,
    keyEncoding: bucket.keyEncoding,
    prefix: bucket.prefix,
    samples,
    valueEncoding: 'u128le',
    valueOffset,
    valuePath: null,
  };
};

export const inferLayout = async (
  rpc: RPC,
  contract: string,
  blockHeight: number,
): Promise<LayoutResult> => {
  const buckets = new Map<string, Bucket>();
  let probedHeight: null | number = null;
  let balanceShapedWrites = 0;
  let entryWrites = 0;

  for (const probe of probeOrder(blockHeight)) {
    const changes = await dataChanges(rpc, contract, probe);

    for (const change of changes) {
      if (change.key.equals(STATE_KEY)) continue;

      entryWrites++;
      if (change.value.length === 16) balanceShapedWrites++;

      for (const observation of observe(change)) {
        const bucketKey = [
          observation.valueEncoding,
          observation.keyEncoding,
          observation.accountPath ?? '',
          observation.prefix.toString('hex'),
        ].join(':');

        if (!buckets.has(bucketKey) && buckets.size >= MAX_COMPETING_PREFIXES)
          continue;

        let bucket = buckets.get(bucketKey);
        if (!bucket) {
          bucket = {
            accountPath: observation.accountPath,
            keyEncoding: observation.keyEncoding,
            observations: [],
            prefix: observation.prefix,
            valueEncoding: observation.valueEncoding,
          };
          buckets.set(bucketKey, bucket);
        }

        if (
          !bucket.observations.some(
            (entry) => entry.account === observation.account,
          )
        ) {
          bucket.observations.push(observation);
        }

        probedHeight = probe;
      }
    }

    if (buckets.size) break;
  }

  const candidates: InferredLayout[] = [];

  if (probedHeight !== null) {
    const ordered = [...buckets.values()].sort(
      (a, b) => b.observations.length - a.observations.length,
    );

    for (const bucket of ordered) {
      const candidate = await buildCandidate(
        rpc,
        contract,
        bucket,
        probedHeight,
      );

      if (candidate) candidates.push(candidate);
    }
  }

  if (!candidates.length) {
    const unsupported = entryWrites > 0;
    const reason = buckets.size
      ? `${buckets.size} candidate prefix(es) found but no u128 offset matched ft_balance_of, unsupported value encoding`
      : balanceShapedWrites
      ? `${balanceShapedWrites} balance-shaped write(s) found but none borsh-keyed, unsupported key encoding`
      : unsupported
      ? `${entryWrites} account write(s) found but none account-keyed, unsupported key encoding`
      : `no account writes within ${PROBE_RADIUS} block(s) of ${blockHeight}`;

    logger.warn(`${contract}: ${reason}`);

    return { candidates: null, reason, unsupported };
  }

  return { candidates };
};
