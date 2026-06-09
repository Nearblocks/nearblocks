import { Network } from 'nb-types';

import config from '#config';
import intents from '#libs/intents';
import { dbEvents } from '#libs/knex';

const INTENTS_CONTRACT = 'intents.near';

export const syncMTPrice = async () => {
  if (config.network === Network.TESTNET) {
    return;
  }

  const data = await intents.price();

  if (!data || !data.length) {
    return;
  }

  const rows = data.filter((t) => t.assetId && t.price != null);

  if (!rows.length) {
    return;
  }

  const values = rows.map(() => `(?, ?, ?)`).join(',');
  const bindings = rows.flatMap((t) => [INTENTS_CONTRACT, t.assetId, t.price]);

  await dbEvents.raw(
    `
      UPDATE mt_token_meta AS t
      SET
        price = v.price::numeric,
        refreshed_at = now()
      FROM
        (
          VALUES
            ${values}
        ) AS v (contract, token, price)
      WHERE
        t.contract = v.contract
        AND t.token = v.token
    `,
    bindings,
  );

  const tokens = data.filter(
    (t) => t.assetId && t.contractAddress && t.blockchain,
  );

  if (tokens.length) {
    const tokenValues = tokens.map(() => `(?, ?, ?, ?)`).join(',');
    const tokenBindings = tokens.flatMap((t) => [
      t.assetId,
      t.contractAddress,
      t.blockchain,
      t.decimals,
    ]);

    await dbEvents.raw(
      `
        INSERT INTO
          mt_intents_tokens (token, contract, blockchain, decimals)
        VALUES
          ${tokenValues}
        ON CONFLICT (token) DO UPDATE
        SET
          contract = EXCLUDED.contract,
          blockchain = EXCLUDED.blockchain,
          decimals = EXCLUDED.decimals
      `,
      tokenBindings,
    );
  }

  const history = data
    .filter((t) => t.assetId && t.price != null && t.priceUpdatedAt)
    .map((t) => ({
      price: t.price,
      token: t.assetId,
      updatedAt: new Date(t.priceUpdatedAt).getTime(),
    }))
    .filter((t) => !Number.isNaN(t.updatedAt));

  if (!history.length) {
    return;
  }

  const historyValues = history.map(() => `(?, ?, ?)`).join(',');
  const historyBindings = history.flatMap((t) => [
    t.updatedAt,
    t.price,
    t.token,
  ]);

  await dbEvents.raw(
    `
      INSERT INTO
        mt_intents_prices (updated_at, price, token)
      VALUES
        ${historyValues}
      ON CONFLICT (token, updated_at) DO NOTHING
    `,
    historyBindings,
  );
};
