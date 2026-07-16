import { logger } from 'nb-logger';
import { Action, ExecutionStatus, Message } from 'nb-neardata';
import { AccessKeyPermissionKind, ActionKind } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { db } from '#libs/knex';
import metrics from '#libs/prom';
import { storeAccessKeys } from '#services/accessKey';
import { storeAccounts } from '#services/account';

const indexerKey = 'accounts';
const CATCH_UP_DELAY_MS = 60_000;
const TIP_SAFETY_MARGIN_NS = 60_000_000_000n;

const ACTION_KINDS = [
  ActionKind.ADD_KEY,
  ActionKind.CREATE_ACCOUNT,
  ActionKind.DELEGATE_ACTION,
  ActionKind.DELETE_ACCOUNT,
  ActionKind.DELETE_KEY,
  ActionKind.DETERMINISTIC_STATE_INIT,
  ActionKind.TRANSFER,
];

type BackfillArgs = {
  access_key?: {
    nonce: number;
    permission: {
      permission_details?: {
        allowance: null | string;
        method_names: string[];
        receiver_id: string;
      };
      permission_kind: string;
    };
  };
  beneficiary_id?: string;
  deposit?: string;
  public_key?: string;
};

type BackfillRow = {
  action_kind: string;
  args: BackfillArgs;
  block_height: string;
  executed_in_block_timestamp: string;
  index_in_action_receipt: number;
  index_in_chunk: number;
  receipt_id: string;
  receipt_predecessor_account_id: string;
  receipt_receiver_account_id: string;
  shard_id: number;
};

type BackfillReceipt = {
  actions: { action: Action; index: number }[];
  hasDelegate: boolean;
  predecessorId: string;
  receiptId: string;
  receiverId: string;
};

type BackfillBlock = {
  height: string;
  receipts: Map<string, BackfillReceipt>;
  timestamp: string;
};

export const backfillData = async () => {
  const settings = await db('settings').where({ key: indexerKey }).first();
  let from = BigInt(
    String(settings?.value?.backfillTimestamp ?? config.genesisTimestamp),
  );

  logger.info(`backfilling from timestamp: ${from}`);

  for (;;) {
    const tip = await sourceTip();

    if (!tip || from >= tip - TIP_SAFETY_MARGIN_NS) {
      logger.info(`backfill caught up to source tip: ${tip}, waiting...`);
      await new Promise((resolve) => setTimeout(resolve, CATCH_UP_DELAY_MS));
      continue;
    }

    const to = bigIntMin(
      from + config.backfillWindowSize,
      tip - TIP_SAFETY_MARGIN_NS,
    );

    const rows = await retry(async () => fetchWindow(from, to));
    const blocks = groupBlocks(rows);
    let lastHeight: null | string = null;

    for (const block of blocks) {
      const message = buildMessage(block);

      await storeAccounts(db, message);
      await storeAccessKeys(db, message);

      lastHeight = block.height;
    }

    await db('settings')
      .insert({
        key: indexerKey,
        value: {
          backfillTimestamp: to.toString(),
          sync: lastHeight ?? settings?.value?.sync ?? config.genesisHeight,
        },
      })
      .onConflict('key')
      .merge();

    if (lastHeight) {
      metrics.sync.blockHeight.set(Number(lastHeight));
      logger.info(
        `backfilled ${blocks.length} blocks upto: ${lastHeight}, window: ${to}`,
      );
    }

    from = to;
  }
};

const sourceTip = async (): Promise<bigint | null> => {
  const result = await retry(async () => {
    return db.raw(
      'SELECT max(executed_in_block_timestamp) AS tip FROM public.execution_outcomes',
    );
  });
  const tip = result?.rows?.[0]?.tip;

  return tip ? BigInt(tip) : null;
};

const fetchWindow = async (from: bigint, to: bigint) => {
  const result = await db.raw(
    `
      SELECT
        eo.executed_in_block_timestamp,
        eo.shard_id,
        eo.index_in_chunk,
        ara.receipt_id,
        ara.receipt_predecessor_account_id,
        ara.receipt_receiver_account_id,
        ara.action_kind,
        ara.args,
        ara.index_in_action_receipt,
        b.block_height
      FROM public.execution_outcomes eo
      JOIN public.action_receipt_actions ara ON ara.receipt_id = eo.receipt_id
      JOIN public.blocks b ON b.block_timestamp = eo.executed_in_block_timestamp
      WHERE eo.executed_in_block_timestamp >= :from
        AND eo.executed_in_block_timestamp < :to
        AND eo.status IN ('SUCCESS_VALUE', 'SUCCESS_RECEIPT_ID')
        AND ara.action_kind = ANY(:kinds)
        AND (
          ara.action_kind <> 'TRANSFER'
          OR char_length(ara.receipt_receiver_account_id) = 64
          OR ara.receipt_receiver_account_id LIKE '0x%'
        )
      ORDER BY
        eo.executed_in_block_timestamp ASC,
        eo.shard_id ASC,
        eo.index_in_chunk ASC,
        ara.index_in_action_receipt ASC
    `,
    { from: from.toString(), kinds: ACTION_KINDS, to: to.toString() },
  );

  return result.rows as BackfillRow[];
};

const groupBlocks = (rows: BackfillRow[]): BackfillBlock[] => {
  const blocks = new Map<string, BackfillBlock>();

  for (const row of rows) {
    let block = blocks.get(row.executed_in_block_timestamp);

    if (!block) {
      block = {
        height: row.block_height,
        receipts: new Map(),
        timestamp: row.executed_in_block_timestamp,
      };
      blocks.set(row.executed_in_block_timestamp, block);
    }

    let receipt = block.receipts.get(row.receipt_id);

    if (!receipt) {
      receipt = {
        actions: [],
        hasDelegate: false,
        predecessorId: row.receipt_predecessor_account_id,
        receiptId: row.receipt_id,
        receiverId: row.receipt_receiver_account_id,
      };
      block.receipts.set(row.receipt_id, receipt);
    }

    if (row.action_kind === ActionKind.DELEGATE_ACTION) {
      receipt.hasDelegate = true;
      continue;
    }

    if (receipt.actions.some((a) => a.index === row.index_in_action_receipt)) {
      continue;
    }

    receipt.actions.push({
      action: buildAction(row),
      index: row.index_in_action_receipt,
    });
  }

  return [...blocks.values()];
};

const buildAction = (row: BackfillRow): Action => {
  switch (row.action_kind) {
    case ActionKind.ADD_KEY: {
      const permission = row.args.access_key?.permission;
      const details = permission?.permission_details;

      return {
        AddKey: {
          accessKey: {
            nonce: row.args.access_key?.nonce ?? 0,
            permission:
              permission?.permission_kind ===
                AccessKeyPermissionKind.FUNCTION_CALL && details
                ? {
                    FunctionCall: {
                      allowance: details.allowance as string,
                      methodNames: details.method_names,
                      receiverId: details.receiver_id,
                    },
                  }
                : 'FullAccess',
          },
          publicKey: row.args.public_key as string,
        },
      };
    }
    case ActionKind.CREATE_ACCOUNT:
      return 'CreateAccount';
    case ActionKind.DELETE_ACCOUNT:
      return {
        DeleteAccount: { beneficiaryId: row.args.beneficiary_id as string },
      };
    case ActionKind.DELETE_KEY:
      return { DeleteKey: { publicKey: row.args.public_key as string } };
    case ActionKind.DETERMINISTIC_STATE_INIT:
      return {
        DeterministicStateInit: row.args,
      } as unknown as Action;
    case ActionKind.TRANSFER:
      return { Transfer: { deposit: row.args.deposit as string } };
    default:
      logger.warn(`unexpected action kind in backfill: ${row.action_kind}`);

      return { Stake: { publicKey: '', stake: '0' } } as unknown as Action;
  }
};

const buildMessage = (block: BackfillBlock): Message => {
  const receiptExecutionOutcomes = [...block.receipts.values()]
    .filter((receipt) => !receipt.hasDelegate)
    .map((receipt) => ({
      executionOutcome: {
        id: receipt.receiptId,
        outcome: {
          status: { SuccessValue: '' } as ExecutionStatus,
        },
      },
      receipt: {
        predecessorId: receipt.predecessorId,
        receipt: {
          Action: {
            actions: receipt.actions.map((action) => action.action),
          },
        },
        receiptId: receipt.receiptId,
        receiverId: receipt.receiverId,
      },
    }));

  return {
    block: {
      header: {
        height: Number(block.height),
        timestampNanosec: block.timestamp,
      },
    },
    shards: [{ receiptExecutionOutcomes }],
  } as unknown as Message;
};

const bigIntMin = (a: bigint, b: bigint): bigint => (a < b ? a : b);
