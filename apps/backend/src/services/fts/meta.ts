import { logger } from 'nb-logger';

import dayjs from '#libs/dayjs';
import { upsertError } from '#libs/events';
import { dbEvents } from '#libs/knex';
import { fetchFTMeta } from '#libs/near';
import { accountToHex } from '#libs/utils';
import { FTMetadata, MetaContract, Raw } from '#types/types';

export const syncFTMeta = async () => {
  const { rows: fts } = await dbEvents.raw<Raw<MetaContract>>(`
    SELECT
      contract
    FROM
      ft_meta fm
    WHERE
      fm.modified_at IS NULL
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
    LIMIT
      10
  `);

  await Promise.all(fts.map((ft) => updateFTMeta(ft.contract)));
};

export const refreshFTMeta = async () => {
  const { rows: fts } = await dbEvents.raw<Raw<MetaContract>>(
    `
      SELECT
        contract
      FROM
        ft_meta
      WHERE
        modified_at < ?
      ORDER BY
        modified_at ASC
      LIMIT
        10
    `,
    [dayjs.utc().subtract(7, 'day').toISOString()],
  );

  await Promise.all(
    fts.map(async (ft) => {
      const meta = await fetchFTMeta(ft.contract);

      if (meta) {
        await updateMeta(ft.contract, meta);
      } else {
        await dbEvents.raw(
          `
            UPDATE ft_meta
            SET
              modified_at = ?
            WHERE
              contract = ?
          `,
          [dayjs.utc().toISOString(), ft.contract],
        );
      }
    }),
  );
};

const updateFTMeta = async (contract: string) => {
  try {
    const meta = await fetchFTMeta(contract);

    if (meta) {
      await updateMeta(contract, meta);
    } else {
      await upsertError(contract, 'ft', null);
    }
  } catch (error) {
    logger.error(`tokenMeta: updateFTMeta: ${contract}`);
    logger.error(error);
    await upsertError(contract, 'ft', null);
  }
};

const updateMeta = async (contract: string, meta: FTMetadata) => {
  const hexAddress = accountToHex(contract);
  const data = {
    decimals: meta.decimals,
    hex_address: hexAddress,
    icon: meta.icon,
    modified_at: dayjs.utc().toISOString(),
    name: meta.name,
    reference: meta.reference,
    reference_hash: meta.reference_hash,
    spec: meta.spec,
    symbol: meta.symbol,
  };

  try {
    await dbEvents('ft_meta').where('contract', contract).update(data);
  } catch (error) {
    logger.error(`tokenMeta: updateMeta: ${contract}`);
    logger.error(error);
  }
};

export const resetFTMeta = async (contracts: string[]) => {
  try {
    await dbEvents.transaction(async (tx) => {
      return Promise.all([
        tx.raw(
          `
            UPDATE ft_meta
            SET
              modified_at = NULL
            WHERE
              contract = ANY(?)
              AND modified_at IS NOT NULL
          `,
          [contracts],
        ),
        tx.raw(
          `
            DELETE FROM errored_contracts
            WHERE
              contract = ANY(?)
              AND type = ?
              AND token IS NULL
          `,
          [contracts, 'ft'],
        ),
      ]);
    });
  } catch (error) {
    logger.error(`tokenMetaReset: resetFTMeta: ${contracts.join(',')}`);
    logger.error(error);
  }
};
