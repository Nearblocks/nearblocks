import { createReadStream, createWriteStream } from 'fs';

import { default as axios } from 'axios';
import chain from 'stream-chain';
import pick from 'stream-json/filters/Pick.js';
import streamObject from 'stream-json/streamers/StreamObject.js';

import { logger } from 'nb-logger';
import { JsonObject } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { dbRead, dbWrite } from '#libs/knex';
import { getAccessKeyData, storeGenesisAccessKeys } from '#services/accessKey';
import { getAccountData, storeGenesisAccounts } from '#services/account';

const genesisKey = 'genesis';
const genesisValue = { sync: true } as JsonObject;

export const syncGenesis = async () => {
  const settings = await dbRead('settings').where({ key: genesisKey }).first();

  const genesis = settings?.value as JsonObject;

  if (genesis?.sync) {
    logger.warn('genesis data already synced...');
    return;
  }

  logger.info('downloading genesis file...');
  const path = await downloadGenesisData();
  logger.info('genesis file downloaded...');

  logger.info('inserting genesis data...');
  await insertGenesisData(path);
  await retry(async () => {
    await dbWrite('settings')
      .insert({ key: genesisKey, value: genesisValue })
      .onConflict('key')
      .merge();
  });
  logger.info('genesis sync finished...');
};

export const downloadGenesisData = async (): Promise<string> => {
  const { data } = await axios.get(config.genesisFile, {
    responseType: 'stream',
  });
  const path = 'genesis.json';
  const writer = createWriteStream(path);

  data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(path));
    writer.on('error', reject);
  });
};

export const insertGenesisData = async (path: string) => {
  const readable = new chain([
    createReadStream(path),
    pick.withParser({ filter: /^records\.\w+/ }),
    new streamObject(),
  ]);

  let accounts = [];
  let accessKeys = [];
  let accountsCount = 0;
  let accessKeysCount = 0;

  for await (const chunk of readable) {
    if (accounts.length === config.insertLimit) {
      await storeGenesisAccounts(dbWrite, accounts);
      accounts = [];
    }

    if (accessKeys.length === config.insertLimit) {
      await storeGenesisAccessKeys(dbWrite, accessKeys);
      accessKeys = [];
    }

    if (chunk.key === 'Account') {
      const accountData = getAccountData(
        chunk.value.account_id,
        config.genesisTimestamp,
      );

      accounts.push(accountData);
      accountsCount++;
    }

    if (chunk.key === 'AccessKey') {
      const accessKeyData = getAccessKeyData(
        chunk.value.account_id,
        chunk.value.public_key,
        chunk.value.access_key.permission,
        config.genesisTimestamp,
      );

      accessKeys.push(accessKeyData);
      accessKeysCount++;
    }
  }

  await storeGenesisAccounts(dbWrite, accounts);
  await storeGenesisAccessKeys(dbWrite, accessKeys);

  logger.info(
    `inserted ${accountsCount} accounts and ${accessKeysCount} access keys...`,
  );
};
