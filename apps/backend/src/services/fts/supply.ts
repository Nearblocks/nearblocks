import { logger } from 'nb-logger';

import dayjs from '#libs/dayjs';
import { upsertError } from '#libs/events';
import { dbEvents } from '#libs/knex';
import { fetchFTSupply } from '#libs/near';
import { tokenAmount } from '#libs/utils';
import { FTContractDecimals, Raw } from '#types/types';

export const syncFTSupply = async () => {
  const { rows: fts } = await dbEvents.raw<Raw<FTContractDecimals>>(`
    SELECT
      contract,
      decimals
    FROM
      ft_meta fm
    WHERE
      fm.modified_at IS NOT NULL
      AND NOT EXISTS (
        SELECT
          1
        FROM
          errored_contracts ec
        WHERE
          fm.contract = ec.contract
          AND ec.type = 'ft'
          AND ec.attempts >= 5
      )
    ORDER BY
      fm.synced_at ASC
    LIMIT
      10
  `);

  await Promise.all(fts.map((ft) => updateFTSupply(ft)));
};

const updateFTSupply = async (ft: FTContractDecimals) => {
  try {
    const supply = await fetchFTSupply(ft.contract);

    if (supply) {
      await updateSupply(ft, supply);
    } else {
      await upsertError(ft.contract, 'ft', null);
    }
  } catch (error) {
    logger.error(`tokenSupply: updateFTMeta: ${ft.contract}: ${ft.decimals}`);
    logger.error(error);
    await upsertError(ft.contract, 'ft', null);
  }
};

const updateSupply = async (ft: FTContractDecimals, supply: string) => {
  const totalSupply = tokenAmount(supply, ft.decimals);
  const data = {
    synced_at: dayjs.utc().toISOString(),
    total_supply: totalSupply,
  };

  try {
    await dbEvents('ft_meta').where('contract', ft.contract).update(data);
  } catch (error) {
    logger.error(`tokenMeta: updateMeta: ${ft.contract}: ${ft.decimals}`);
    logger.error(error);
  }
};
