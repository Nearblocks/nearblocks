import { stream, types } from 'near-lake-framework';

import config from '#config';
import knex from '#libs/knex';
import logger from '#libs/log';
import redis from '#libs/redis';
import sentry from '#libs/sentry';
import { FtEventKind } from '#ts/enums';
import { isFunctionCallAction } from '#libs/guards';
import { EventType, EVENT_PATTERN } from '#services/events';
import { AssetsFungibleTokenEvent, FtEventEntry } from '#ts/types';
import { decodeArgs, isExecutionSuccess, sleep } from '#libs/utils';
import {
  getFTData,
  ftTransfer,
  ftTransferCall,
  ftResolveTransfer,
} from '#services/ft';

type FtWithdraw = {
  amount: string;
};

type EventObject = {
  reindex: boolean;
  items: FtEventEntry[];
};

const EVENT_TYPE = EventType.WRAP_NEAR;

const service = 'wrap.near'; // A unique job name / file name
const startsAt = 30180000; // Start from block height
const stopsAt = 84000000; // Stops at block height (optional)

const lakeConfig: types.LakeConfig = {
  s3BucketName: config.s3BucketName,
  s3RegionName: config.s3RegionName,
  startBlockHeight: startsAt,
  blocksPreloadPoolSize: config.preloadSize,
};

const matchActions = (
  action: types.FunctionCallAction,
  predecessor: string,
  logs: string[],
): EventObject => {
  switch (action.FunctionCall.methodName) {
    case 'near_deposit': {
      let reindex = false;
      const items: FtEventEntry[] = [];
      const amount = action.FunctionCall.deposit;

      logs.forEach((log) => {
        if (EVENT_PATTERN.WRAP_NEAR_DEPOSIT.test(log)) {
          const match = log.match(EVENT_PATTERN.WRAP_NEAR_DEPOSIT);

          if (match?.length !== 3) {
            logger.warn({ action, log });
            throw Error('Pattern matching failed for near_deposit');
          }

          if (amount !== match[1]) {
            logger.info({ amount, newAmount: match[1] });
            reindex = true;
          }

          items.push({
            kind: FtEventKind.MINT,
            amount: match[1],
            from: '',
            to: match[2],
            memo: '',
          });
        }
      });

      return { reindex, items };
    }
    case 'near_withdraw': {
      const args = decodeArgs<FtWithdraw>(action.FunctionCall.args);

      return {
        reindex: false,
        items: [
          {
            kind: FtEventKind.BURN,
            amount: args.amount,
            from: predecessor,
            to: '',
            memo: '',
          },
        ],
      };
    }
    case 'ft_transfer': {
      return {
        reindex: false,
        items: ftTransfer(action.FunctionCall.args, predecessor),
      };
    }
    case 'ft_transfer_call': {
      return {
        reindex: false,
        items: ftTransferCall(action.FunctionCall.args, predecessor),
      };
    }
    case 'ft_resolve_transfer': {
      return { reindex: false, items: ftResolveTransfer(logs) };
    }
    default:
      return { reindex: false, items: [] };
  }
};

const onMessage = async (message: types.StreamerMessage) => {
  await Promise.all(
    message.shards.map(async (shard) => {
      await Promise.all(
        shard.receiptExecutionOutcomes.map(async (outcome) => {
          if (
            outcome.receipt?.receiverId === 'wrap.near' &&
            outcome.executionOutcome.outcome.logs &&
            isExecutionSuccess(outcome.executionOutcome.outcome.status)
          ) {
            let reindex = false;
            const block = message.block.header;
            const events: AssetsFungibleTokenEvent[] = [];
            const predecessor = outcome.receipt.predecessorId;
            const logs = outcome.executionOutcome.outcome.logs;
            const receipt = {
              receiptId: outcome.receipt.receiptId,
              blockTimestamp: block.timestampNanosec,
              shardId: shard.shardId,
              eventType: EVENT_TYPE,
              receiverId: outcome.receipt.receiverId,
            };

            if ('Action' in outcome.receipt.receipt) {
              outcome.receipt.receipt.Action?.actions.forEach((action) => {
                if (isFunctionCallAction(action)) {
                  try {
                    const eventObject = matchActions(action, predecessor, logs);

                    if (eventObject.reindex && eventObject.items.length) {
                      reindex = true;
                      eventObject.items.forEach((eventItem) =>
                        events.push(
                          getFTData(receipt, events.length, eventItem),
                        ),
                      );
                    }
                  } catch (error) {
                    logger.error(error);
                    sentry.captureException(error);
                  }
                }
              });
            }

            if (reindex && events.length) {
              await knex.transaction(async (trx) => {
                const deleted = await trx('assets__fungible_token_events')
                  .where({
                    emitted_for_receipt_id: receipt.receiptId,
                    emitted_at_block_timestamp: receipt.blockTimestamp,
                    emitted_in_shard_id: receipt.shardId,
                    emitted_for_event_type: receipt.eventType,
                    event_kind: FtEventKind.MINT,
                  })
                  .del()
                  .returning('*');

                const inserted = await trx('assets__fungible_token_events')
                  .insert(events)
                  .returning('*');

                logger.info({ deleted, inserted });

                if (deleted.length !== inserted.length) {
                  throw Error(
                    'Reindexing stopped: delete, insert rows mismatch',
                  );
                }
              });
            }
          }
        }),
      );
    }),
  );
};

// No need make changes past this line
const handleMessage = async (message: types.StreamerMessage) => {
  try {
    const block = message.block.header.height;

    if (stopsAt && stopsAt + 10 <= block) {
      // Work around to end data streaming until there is a way to interrupt streaming programatically https://github.com/near/near-lake-framework-js/issues/2
      process.exit();
    }

    if (block % 1000 === 0) logger.info(`${service}: syncing block: ${block}`);
    await onMessage(message);
    await redis.set(`job:${service}`, block + 1);
  } catch (error) {
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};

const job = async () => {
  lakeConfig.startBlockHeight = startsAt;
  const block = await redis.get(`job:${service}`);

  if (stopsAt && block && stopsAt <= +block) return;

  if (block && +block > startsAt) {
    const next = +block - config.delta;
    const start = next > startsAt ? next : startsAt;
    lakeConfig.startBlockHeight = start;
    logger.info(`${service}: last synced block: ${block}`);
    logger.info(`${service}: syncing from block: ${start}`);
  }

  for await (const message of stream(lakeConfig)) {
    await sleep(50);
    await handleMessage(message);
  }
};

export default job;
