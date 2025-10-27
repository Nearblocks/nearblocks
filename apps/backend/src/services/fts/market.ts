import { isNull, omitBy } from 'es-toolkit';

import { logger } from 'nb-logger';
import { Network } from 'nb-types';

import config from '#config';
import cg from '#libs/cg';
import cmc from '#libs/cmc';
import dayjs from '#libs/dayjs';
import { dbEvents } from '#libs/knex';
import ref from '#libs/ref';
import { MetaContract, Raw } from '#types/types';

export const syncFTData = async () => {
  if (config.network === Network.TESTNET) {
    return;
  }

  const { rows: fts } = await dbEvents.raw<Raw<MetaContract>>(
    `
      SELECT
        contract
      FROM
        ft_meta
      WHERE
        searched_at IS NULL
        OR searched_at < ?
      LIMIT
        10
    `,
    [dayjs.utc().subtract(7, 'days').toISOString()],
  );

  await Promise.all(fts.map((ft) => updateFTData(ft.contract)));
};

export const syncFTPrice = async () => {
  if (config.network === Network.TESTNET) {
    return;
  }

  const data = await ref.price();

  if (!data) {
    return;
  }

  const keys = Object.keys(data);
  const values = keys.map(() => `(?, ?)`).join(',');
  const bindings = keys.flatMap((key) => [key, data[key].price]);

  await dbEvents.raw(
    `
      UPDATE ft_meta AS t
      SET
        price = v.price::numeric,
        refreshed_at = now()
      FROM
        (
          VALUES
            ${values}
        ) AS v (contract, price)
      WHERE
        t.contract = v.contract
    `,
    bindings,
  );
};

const updateFTData = async (contract: string) => {
  try {
    const [cmcData, cgData] = await Promise.all([
      cmc.search(contract),
      cg.search(contract),
    ]);

    const data = {
      ...omitBy(cmcData || {}, isNull),
      ...omitBy(cgData || {}, isNull),
      searched_at: dayjs.utc().toISOString(),
    };

    await dbEvents('ft_meta').where('contract', contract).update(data);
  } catch (error) {
    logger.error(`tokenMarket: updateFTData: ${contract}`);
    logger.error(error);
  }
};
