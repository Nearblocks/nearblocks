import config from '#config';
import { dbEvents } from '#libs/knex';

export const SYNC_KEY = 'ft_finder';

export const iso = (ns: bigint): string =>
  new Date(Number(ns / 1_000_000n)).toISOString();

export const chunks = <T>(items: T[], size: number): T[][] => {
  const result: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }

  return result;
};

export const getSyncedValue = async (): Promise<bigint | null> => {
  if (config.fromScratch) return null;

  const settings = await dbEvents('settings').where('key', SYNC_KEY).first();
  const sync = settings?.value?.sync as string | undefined;

  return sync ? BigInt(sync) : null;
};

export const updateSyncedValue = async (value: bigint): Promise<void> => {
  await dbEvents('settings')
    .insert({ key: SYNC_KEY, value: { sync: value.toString() } })
    .onConflict('key')
    .merge();
};
