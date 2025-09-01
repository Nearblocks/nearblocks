import { viewFunctionAsJson } from '@near-js/jsonrpc-client/no-validation';

import { logger } from 'nb-logger';

import dayjs from '#libs/dayjs';
import { upsertError } from '#libs/events';
import { dbEvents, pgp } from '#libs/pgp';
import { rpc } from '#libs/rpc';
import { accountToHex } from '#libs/utils';
import { FTMetadata } from '#types/types';

export const syncFTMeta = async () => {
  const fts = await dbEvents.manyOrNone(`
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

export const updateFTMeta = async (contract: string) => {
  try {
    const meta = await viewFunctionAsJson<FTMetadata>(rpc, {
      accountId: contract,
      methodName: 'ft_metadata',
    });
    const hexAddress = accountToHex(contract);

    if (meta?.name && meta?.symbol) {
      const data = {
        contract,
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
        const columns = new pgp.helpers.ColumnSet(Object.keys(data), {
          table: 'ft_meta',
        });

        await dbEvents.none(
          pgp.helpers.insert(data, columns) +
            ` ON CONFLICT (contract) DO UPDATE SET ` +
            columns.assignColumns({ from: 'EXCLUDED', skip: ['contract'] }),
        );
      } catch (error) {
        logger.error(error);
      }
    } else {
      await upsertError(contract, 'ft', null);
    }
  } catch (error) {
    logger.error(error);
    await upsertError(contract, 'ft', null);
  }
};
