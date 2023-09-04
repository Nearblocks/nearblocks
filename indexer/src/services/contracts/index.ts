import path from 'path';
import { globby } from 'globby';
import { types } from 'near-lake-framework';

import { Knex } from 'knex';

import log from '#libs/log';
import config from '#config';
import { Network } from '#ts/enums';
import { EventContract } from '#ts/types';

const basePath = `build/src/services/contracts/${config.network}`;
const contracts = await globby([`${basePath}/*`]);

export const matchContractEvents = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  await Promise.all(
    message.shards.map(async (shard) => {
      await Promise.all(
        shard.receiptExecutionOutcomes.map(async (outcome) => {
          if (outcome.receipt) {
            try {
              const receiver = outcome.receipt.receiverId;
              const contract = await matchContract(contracts, receiver);

              if (contract) {
                await contract(
                  knex,
                  message.block.header,
                  shard.shardId,
                  outcome,
                );
              }
            } catch (error) {
              log.error(error);
            }
          }
        }),
      );
    }),
  );
};

const matchContract = async (
  contracts: string[],
  receiver: string,
): Promise<EventContract | undefined> => {
  const filePath = `${basePath}/${receiver}.js`;

  switch (true) {
    case receiver.endsWith('.factory.bridge.near'): {
      if (config.network === Network.MAINNET) {
        const { default: contract } = await import(
          './mainnet/factory.bridge.near.js'
        );

        return contract;
      }

      return;
    }
    case receiver.endsWith('.tkn.near'): {
      if (config.network === Network.MAINNET) {
        const { default: contract } = await import('./mainnet/tkn.near.js');

        return contract;
      }

      return;
    }
    case receiver.endsWith('abr.a11bd.near'):
    case receiver.endsWith('xabr.a11bd.near'):
    case receiver.endsWith('.token.a11bd.near'): {
      if (config.network === Network.MAINNET) {
        const { default: contract } = await import(
          './mainnet/token.a11bd.near.js'
        );

        return contract;
      }

      return;
    }

    default: {
      if (contracts.includes(filePath)) {
        const { default: contract } = await import(path.resolve(filePath));

        return contract as EventContract;
      }

      return;
    }
  }
};
