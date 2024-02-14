import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import { RPC } from 'nb-near';
import { msToNsTime, nsToMsTime, retry } from 'nb-utils';

import config from '#config';
import dayjs from '#libs/dayjs';
import { ftBalance } from '#libs/near';
import { splitArray } from '#libs/utils';
import { Snapshot } from '#types/enums';
import { SnapshotEvent, SnapshotStartParams } from '#types/types';

export const snapshotFTBalance = async (trx: Knex) => {
  const latestBlock = await trx('blocks')
    .orderBy('block_timestamp', 'desc')
    .first();

  if (!latestBlock) return;

  const blockDate = dayjs.utc(nsToMsTime(latestBlock.block_timestamp));
  const startParams = await getStartParams(trx, blockDate);

  if (!startParams || dayjs.utc().isSameOrBefore(startParams.date)) return;

  logger.info({ job: 'events', startParams });

  const events = await getEvents(trx, startParams);

  if (events.length) {
    const [setOne, setTwo] = splitArray<SnapshotEvent>(events);

    await Promise.all([
      ...setOne.map((event) => processEvent(trx, event, config.rpcUrl)),
      ...setTwo.map((event) => processEvent(trx, event, config.rpcUrl2)),
    ]);
  }

  await trx('settings')
    .insert({
      key: 'event-snapshots',
      value: {
        date: startParams.date.format('YYYY-MM-DD'),
        finished: events.length < Snapshot.LIMIT,
        index: events.length ? events[events.length - 1].event_index : null,
      },
    })
    .onConflict('key')
    .merge();
};

const getStartParams = async (
  trx: Knex,
  blockDate: dayjs.Dayjs,
): Promise<SnapshotStartParams | undefined> => {
  const settings = await trx('settings')
    .where('key', 'event-snapshots')
    .first()
    .forUpdate()
    .skipLocked();

  if (!settings) {
    if (blockDate.isSameOrBefore(config.genesisDate, 'day')) return;

    return { date: dayjs.utc(config.genesisDate), index: null };
  }

  const date = dayjs.utc(settings.value?.date as string);

  if (settings.value?.finished) {
    return { date: date.add(1, 'day'), index: null };
  }

  return {
    date,
    index: settings.value?.index as string,
  };
};

const getEvents = async (trx: Knex, startParams: SnapshotStartParams) => {
  const start = msToNsTime(startParams.date.startOf('day').valueOf());
  const end = msToNsTime(startParams.date.endOf('day').valueOf());

  const query = trx('ft_events')
    .select('contract_account_id', 'affected_account_id')
    .max('event_index as event_index')
    .max('block_height as block_height')
    .whereBetween('block_timestamp', [start, end]);

  if (startParams.index) {
    query.havingRaw('max(event_index) < ?', [startParams.index]);
  }

  const resp: unknown = await query
    .groupBy('contract_account_id', 'affected_account_id')
    .orderBy('event_index', 'desc')
    .limit(Snapshot.LIMIT);

  return resp as SnapshotEvent[];
};

const processEvent = async (
  trx: Knex,
  event: SnapshotEvent,
  rpcUrl: string,
) => {
  const balance = await getRPCBalance(
    rpcUrl,
    event.contract_account_id,
    event.affected_account_id,
    +event.block_height,
  );

  await trx('ft_events')
    .where('event_index', event.event_index)
    .update({ absolute_amount: balance });
};

const getRPCBalance = async (
  rpcUrl: string,
  contractId: string,
  accountId: string,
  blockId: number | string,
) => {
  const near = new RPC(rpcUrl);
  const balance = await retry(
    async () => ftBalance(near, contractId, accountId, blockId),
    { retries: 1 },
  );

  if (balance === null) {
    logger.error({
      job: 'events',
      params: { accountId, blockId, contractId },
    });
    throw Error();
  }

  return balance;
};
