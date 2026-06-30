import { isNull, omitBy } from 'es-toolkit';

import { logger } from 'nb-logger';
import { Network } from 'nb-types';

import config from '#config';
import cg from '#libs/cg';
import cmc from '#libs/cmc';
import dayjs from '#libs/dayjs';
import { dbEvents } from '#libs/knex';
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
