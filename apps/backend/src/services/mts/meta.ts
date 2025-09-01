import { viewFunctionAsJson } from '@near-js/jsonrpc-client/no-validation';

import { logger } from 'nb-logger';

import dayjs from '#libs/dayjs';
import { upsertError } from '#libs/events';
import { dbEvents, pgp } from '#libs/pgp';
import { rpc } from '#libs/rpc';
import { encodeArgs } from '#libs/utils';
import { MTContractMetadata, MTTokenMetadataInfo } from '#types/types';

export const syncMTMeta = async () => {
  const mts = await dbEvents.manyOrNone(`
    SELECT
      contract
    FROM
      mt_meta mm
    WHERE
      mm.modified_at IS NULL
      AND NOT EXISTS (
        SELECT
          1
        FROM
          errored_contracts ec
        WHERE
          mm.contract = ec.contract
          AND ec.type = 'mt'
          AND ec.token IS NULL
          AND ec.attempts >= 5
      )
    LIMIT
      5
  `);

  await Promise.all(mts.map((mt) => updateMTMeta(mt.contract)));
};

export const syncMTTokenMeta = async () => {
  const mts = await dbEvents.manyOrNone(`
    SELECT
      contract,
      token
    FROM
      mt_base_meta mbm
    WHERE
      mbm.modified_at IS NULL
      AND NOT EXISTS (
        SELECT
          1
        FROM
          errored_contracts ec
        WHERE
          mbm.contract = ec.contract
          AND ec.type = 'mt'
          AND mbm.token = ec.token
          AND ec.attempts >= 5
      )
    LIMIT
      10
  `);

  await Promise.all(mts.map((mt) => updateMTTokenMeta(mt.contract, mt.token)));
};

export const updateMTMeta = async (contract: string) => {
  try {
    const meta = await viewFunctionAsJson<MTContractMetadata>(rpc, {
      accountId: contract,
      methodName: 'mt_metadata_contract',
    });

    if (meta?.name) {
      const data = {
        contract,
        modified_at: dayjs.utc().toISOString(),
        name: meta.name,
        spec: meta.spec,
      };

      try {
        const columns = new pgp.helpers.ColumnSet(Object.keys(data), {
          table: 'mt_meta',
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
      await upsertError(contract, 'mt', null);
    }
  } catch (error) {
    logger.error(error);
    await upsertError(contract, 'mt', null);
  }
};

export const updateMTTokenMeta = async (contract: string, token: string) => {
  try {
    const metas = await viewFunctionAsJson<MTTokenMetadataInfo[]>(rpc, {
      accountId: contract,
      argsBase64: encodeArgs({ token_ids: [token] }),
      methodName: 'mt_metadata_token_all',
    });
    const meta = metas?.[0];

    if (meta?.base && meta?.token) {
      const baseData = {
        base_uri: meta.base.base_uri,
        contract,
        copies: meta.base.copies,
        decimals: meta.base.decimals,
        icon: meta.base.icon,
        modified_at: dayjs.utc().toISOString(),
        name: meta.base.name,
        reference: meta.base.reference,
        reference_hash: meta.base.reference_hash,
        symbol: meta.base.symbol,
        token: meta.base.id,
      };
      const tokenData = {
        contract,
        description: meta.token.description,
        expires_at: meta.token.expires_at,
        extra: meta.token.extra,
        issued_at: meta.token.issued_at,
        media: meta.token.media,
        media_hash: meta.token.media_hash,
        modified_at: dayjs.utc().toISOString(),
        reference: meta.token.reference,
        reference_hash: meta.token.reference_hash,
        starts_at: meta.token.starts_at,
        title: meta.token.title,
        token,
        updated_at: meta.token.updated_at,
      };

      try {
        const baseColumns = new pgp.helpers.ColumnSet(Object.keys(baseData), {
          table: 'mt_base_meta',
        });
        const tokenColumns = new pgp.helpers.ColumnSet(Object.keys(tokenData), {
          table: 'mt_token_meta',
        });

        return await dbEvents.tx(async (tx) => {
          await Promise.all([
            tx.none(
              pgp.helpers.insert(baseData, baseColumns) +
                ` ON CONFLICT (contract, token) DO UPDATE SET ` +
                baseColumns.assignColumns({
                  from: 'EXCLUDED',
                  skip: ['contract', 'token'],
                }),
            ),
            tx.none(
              pgp.helpers.insert(tokenData, tokenColumns) +
                ` ON CONFLICT (contract, token) DO UPDATE SET ` +
                tokenColumns.assignColumns({
                  from: 'EXCLUDED',
                  skip: ['contract', 'token'],
                }),
            ),
          ]);
        });
      } catch (error) {
        logger.error(error);
      }
    } else {
      await upsertError(contract, 'mt', token);
    }
  } catch (error) {
    logger.error(error);
    await upsertError(contract, 'mt', token);
  }
};
