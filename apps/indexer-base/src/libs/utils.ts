import { base58 } from '@scure/base';
import { snakeCase, toUpper } from 'lodash-es';

import { logger } from 'nb-logger';
import { ExecutionStatus, Message } from 'nb-neardata';
import { ExecutionOutcomeStatus, Network } from 'nb-types';

import config from '#config';
import knex from '#libs/knex';

export const mapExecutionStatus = (
  status: ExecutionStatus,
): ExecutionOutcomeStatus => {
  const key = toUpper(
    snakeCase(Object.keys(status)[0]),
  ) as keyof typeof ExecutionOutcomeStatus;

  return ExecutionOutcomeStatus[key];
};

export const publicKeyFromImplicitAccount = (account: string) => {
  try {
    const publicKey = base58.encode(Buffer.from(account, 'hex'));

    return `ed25519:${publicKey}`;
  } catch (error) {
    return null;
  }
};

export const isNearImplicit = (account: string) =>
  account.length === 64 && /[a-f0-9]{64}/.test(account);

export const isEthImplicit = (account: string) =>
  account.length === 42 &&
  account.startsWith('0x') &&
  /^[a-f0-9]{40}$/.test(account.slice(2));

export const checkFastnear = async () => {
  const url =
    config.network === Network.MAINNET
      ? 'https://mainnet.neardata.xyz'
      : 'https://testnet.neardata.xyz';
  const finalResponse = await fetch(`${url}/v0/last_block/final`, {
    method: 'GET',
    signal: AbortSignal.timeout(30000),
  });
  const finalBlock = (await finalResponse.json()) as Message;
  const latestResponse = await fetch(
    `${url}/v0/block/${finalBlock.block.header.height}`,
    {
      method: 'GET',
      signal: AbortSignal.timeout(30000),
    },
  );
  const latestBlock = (await latestResponse.json()) as Message;
  const block = await knex('blocks').orderBy('block_height', 'desc').first();

  logger.info({
    block: block?.block_height,
    helthcheck: true,
    latest: latestBlock.block.header.height,
  });

  if (!block) throw new Error('No block');
  if (block.block_height - latestBlock.block.header.height > 100)
    throw new Error('Not in sync');
};
