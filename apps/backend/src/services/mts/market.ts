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
};
