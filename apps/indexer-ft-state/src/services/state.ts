import { Knex } from 'nb-knex';
import { BlockHeader, Message, Shard } from 'nb-neardata';
import { FTStateBalance } from 'nb-types';
import {
  decodeBorshAccountKey,
  decodeBorshString,
  decodeU128LE,
  decodeU128LEAt,
  readJsonPath,
  retry,
} from 'nb-utils';

import config from '#config';
import {
  isContractCodeUpdate,
  isDataDeletion,
  isDataUpdate,
} from '#libs/guards';
import {
  collectEvidence,
  detectLayout,
  forgetLayout,
  getLayout,
} from '#services/detect';
import { Layout, Resolved, StateChange, StorageWrite } from '#types/types';

const resolveBorsh = (
  contract: string,
  layout: Layout,
  key: Buffer,
  value: Buffer | null,
): null | Resolved => {
  const account = decodeBorshAccountKey(key, layout.keyPrefix);
  if (account === null) return null;

  if (value === null) return { account, amount: 0n };

  if (layout.valueOffset === null) {
    if (value.length !== 16) {
      throw new Error(
        `contradiction: ${contract} verified borsh layout, key for ` +
          `${account} has value length ${value.length}, expected 16`,
      );
    }

    return { account, amount: decodeU128LE(value) };
  }

  const amount = decodeU128LEAt(value, layout.valueOffset);

  if (amount === null) {
    throw new Error(
      `contradiction: ${contract} verified borsh layout at value ` +
        `offset ${layout.valueOffset}, key for ${account} has value length ` +
        `${value.length}`,
    );
  }

  return { account, amount };
};

const resolveIndexed = (
  contract: string,
  layout: Layout,
  key: Buffer,
  value: Buffer | null,
): null | Resolved => {
  const prefix = layout.keyPrefix;

  if (key.length <= prefix.length) return null;
  if (!key.subarray(0, prefix.length).equals(prefix)) return null;
  if (value === null) return null;

  const decoded = decodeBorshString(value, layout.accountOffset as number);
  if (decoded === null) return null;

  const amount = decodeU128LEAt(
    value,
    decoded.end + (layout.valueOffset as number),
  );

  if (amount === null) {
    throw new Error(
      `contradiction: ${contract} verified index layout at value ` +
        `offset ${layout.valueOffset}, key for ${decoded.text} has value ` +
        `length ${value.length}`,
    );
  }

  return { account: decoded.text, amount };
};

const resolveJson = (
  contract: string,
  layout: Layout,
  key: Buffer,
  value: Buffer | null,
): null | Resolved => {
  const prefix = layout.keyPrefix;

  if (key.length <= prefix.length) return null;
  if (!key.subarray(0, prefix.length).equals(prefix)) return null;
  if (value === null) return null;

  let parsed: unknown;

  try {
    parsed = JSON.parse(value.toString('utf8'));
  } catch {
    throw new Error(
      `contradiction: ${contract} verified json layout, key ` +
        `${key.toString('utf8')} has a value that is not JSON`,
    );
  }

  const account = readJsonPath(parsed, layout.accountPath as string);
  const amount = readJsonPath(parsed, layout.valuePath as string);

  if (typeof account !== 'string' || !account) {
    throw new Error(
      `contradiction: ${contract} verified json layout, path ` +
        `${layout.accountPath} is missing for key ${key.toString('utf8')}`,
    );
  }

  if (typeof amount !== 'string' && typeof amount !== 'number') {
    throw new Error(
      `contradiction: ${contract} verified json layout, path ` +
        `${layout.valuePath} is missing for ${account}`,
    );
  }

  return { account, amount: BigInt(amount) };
};

const resolve = (
  contract: string,
  layout: Layout,
  write: StorageWrite,
): null | Resolved => {
  if (layout.valueEncoding === 'json')
    return resolveJson(contract, layout, write.key, write.value);

  if (layout.keyEncoding === 'index')
    return resolveIndexed(contract, layout, write.key, write.value);

  return resolveBorsh(contract, layout, write.key, write.value);
};

export const storeFTState = async (
  knex: Knex,
  message: Message,
): Promise<void> => {
  await Promise.all(
    message.shards.map((shard) =>
      storeShardFTState(knex, shard, message.block.header),
    ),
  );
};

const storeShardFTState = async (
  knex: Knex,
  shard: Shard,
  block: BlockHeader,
): Promise<void> => {
  const stateChanges = shard.stateChanges as StateChange<unknown>[];
  const blockHeight = block.height;
  const evidences = collectEvidence(shard);
  const writesByContract = new Map<string, StorageWrite[]>();

  for (const change of stateChanges) {
    if (isContractCodeUpdate(change)) {
      forgetLayout(change.change.accountId);
      continue;
    }

    const update = isDataUpdate(change);
    if (!update && !isDataDeletion(change)) continue;

    const contract = change.change.accountId;
    if (!getLayout(contract) && !evidences.has(contract)) continue;

    const writes = writesByContract.get(contract) ?? [];

    writes.push({
      causeReceiptHash: change.cause.receiptHash,
      key: Buffer.from(change.change.keyBase64, 'base64'),
      value: update ? Buffer.from(change.change.valueBase64, 'base64') : null,
    });

    writesByContract.set(contract, writes);
  }

  const rows: FTStateBalance[] = [];

  for (const [contract, writes] of writesByContract) {
    let layout = getLayout(contract);

    if (!layout) {
      const evidence = evidences.get(contract);
      if (!evidence?.accounts.size) continue;

      layout = await detectLayout(
        knex,
        contract,
        writes,
        evidence,
        blockHeight,
      );
    }

    if (!layout) continue;

    for (const write of writes) {
      const resolved = resolve(contract, layout, write);

      if (!resolved) continue;

      rows.push({
        absolute_amount: resolved.amount.toString(),
        affected_account_id: resolved.account,
        block_height: blockHeight,
        block_timestamp: block.timestampNanosec,
        contract_account_id: contract,
        index_in_chunk: rows.length,
        receipt_id: write.causeReceiptHash ?? null,
        shard_id: shard.shardId,
      });
    }
  }

  if (!rows.length) return;

  await retry(async () => {
    for (let i = 0; i < rows.length; i += config.insertLimit) {
      await knex('ft_state_balances')
        .insert(rows.slice(i, i + config.insertLimit))
        .onConflict(['block_timestamp', 'shard_id', 'index_in_chunk'])
        .ignore();
    }
  });
};
