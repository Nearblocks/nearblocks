import { Network } from 'nb-types';

import config from '#config';
import intents from '#libs/intents';
import { dbEvents } from '#libs/knex';

export const syncMTTokens = async () => {
  if (config.network === Network.TESTNET) {
    return;
  }

  const data = await intents.price();

  if (!data || !data.length) {
    return;
  }

  const tokens = data.filter((t) => t.assetId && t.blockchain);

  if (!tokens.length) {
    return;
  }

  const tokenValues = tokens.map(() => `(?, ?, ?, ?, ?)`).join(',');
  const tokenBindings = tokens.flatMap((t) => [
    t.assetId,
    t.contractAddress ?? null,
    t.blockchain,
    t.decimals,
    t.coingeckoId ?? null,
  ]);

  await dbEvents.raw(
    `
      INSERT INTO
        mt_intents_tokens (token, contract, blockchain, decimals, coingecko_id)
      VALUES
        ${tokenValues}
      ON CONFLICT (token) DO UPDATE
      SET
        contract = EXCLUDED.contract,
        blockchain = EXCLUDED.blockchain,
        decimals = EXCLUDED.decimals,
        coingecko_id = EXCLUDED.coingecko_id
    `,
    tokenBindings,
  );
};
