import { createRequire } from 'module';

import { ExecutionStatus } from 'nb-blocks';
import { JsonValue } from 'nb-types';
import { sleep } from 'nb-utils';

import config from '#config';
import { dbRead } from '#libs/knex';

const require = createRequire(import.meta.url);
const json = require('nb-json');

export const jsonParse = (args: string) => json.parse(args);

export const jsonStringify = (args: unknown): string => json.stringify(args);

export const decodeArgs = <T>(args: string): T =>
  json.parse(Buffer.from(args, 'base64').toString());

export const isExecutionSuccess = (status: ExecutionStatus) => {
  if ('SuccessValue' in status || 'SuccessReceiptId' in status) {
    return true;
  }

  return false;
};

export const monitorProgress = async (): Promise<void> => {
  let lastBlock: JsonValue | undefined;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const settings = await dbRead('settings')
      .where({ key: config.indexerKey })
      .first();
    const currentBlock = settings?.value?.sync;

    if (lastBlock && currentBlock && lastBlock === currentBlock) {
      throw new Error('indexing stalled...');
    }

    if (currentBlock) {
      lastBlock = currentBlock;
    }

    await sleep(30_000); // 30s
  }
};
