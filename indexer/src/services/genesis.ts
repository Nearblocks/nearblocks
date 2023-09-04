import chain from 'stream-chain';
import { default as axios } from 'axios';
import pick from 'stream-json/filters/Pick.js';
import { createWriteStream, createReadStream } from 'fs';
import streamObject from 'stream-json/streamers/StreamObject.js';

import log from '#libs/log';
import config from '#config';
import knex from '#libs/knex';
import retry from '#libs/retry';
import { JsonObject } from '#ts/types';
import { getGenesisAccountData, storeGenesisAccounts } from '#services/account';
import {
  storeGenesisAccessKeys,
  getGenesisAccessKeyData,
} from '#services/accessKey';

const genesisKey = 'genesis';
const genesisValue = { sync: true } as JsonObject;

export const syncGenesis = async () => {
  const settings = await knex('settings').where({ key: genesisKey }).first();

  const genesis = settings?.value as JsonObject;

  if (genesis?.sync) {
    log.warn('genesis data already synced...');
    return;
  }

  log.info('downloading genesis file...');
  const path = await downloadGenesisData();
  log.info('genesis file downloaded...');

  log.info('inserting genesis data...');
  await insertGenesisData(path);
  await retry(async () => {
    await knex('settings')
      .insert({ key: genesisKey, value: genesisValue })
      .onConflict('key')
      .merge();
  });
  log.info('genesis sync finished...');
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
      await storeGenesisAccounts(knex, accounts);
      accounts = [];
    }

    if (accessKeys.length === config.insertLimit) {
      await storeGenesisAccessKeys(knex, accessKeys);
      accessKeys = [];
    }

    if (chunk.key === 'Account') {
      const accountData = getGenesisAccountData(
        chunk.value.account_id,
        config.genesisHeight,
      );

      accounts.push(accountData);
      accountsCount++;
    }

    if (chunk.key === 'AccessKey') {
      const accessKeyData = getGenesisAccessKeyData(
        chunk.value.account_id,
        chunk.value.public_key,
        typeof chunk.value.access_key.permission,
        config.genesisHeight,
      );

      accessKeys.push(accessKeyData);
      accessKeysCount++;
    }
  }

  await storeGenesisAccounts(knex, accounts);
  await storeGenesisAccessKeys(knex, accessKeys);

  log.info(
    `inserted ${accountsCount} accounts and ${accessKeysCount} access keys...`,
  );
};
