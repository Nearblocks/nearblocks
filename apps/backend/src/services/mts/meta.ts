import { logger } from 'nb-logger';

import dayjs from '#libs/dayjs';
import { upsertError } from '#libs/events';
import { dbEvents } from '#libs/knex';
import { fetchMTMeta, fetchMTTokenMeta } from '#libs/near';
import {
  MetaContract,
  MetaContractToken,
  MTContractMetadata,
  MTTokenMetadataInfo,
  Raw,
} from '#types/types';

export const syncMTMeta = async () => {
  const { rows: mts } = await dbEvents.raw<Raw<MetaContract>>(`
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

export const refreshMTMeta = async () => {
  const { rows: mts } = await dbEvents.raw<Raw<MetaContract>>(
    `
      SELECT
        contract
      FROM
        mt_meta
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
    mts.map(async (mt) => {
      const meta = await fetchMTMeta(mt.contract);

      if (meta) {
        await updateMeta(mt.contract, meta);
      } else {
        await dbEvents.raw(
          `
            UPDATE mt_meta
            SET
              modified_at = ?
            WHERE
              contract = ?
          `,
          [dayjs.utc().toISOString(), mt.contract],
        );
      }
    }),
  );
};

export const syncMTTokenMeta = async () => {
  const { rows: mts } = await dbEvents.raw<Raw<MetaContractToken>>(`
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
    const meta = await fetchMTMeta(contract);

    if (meta) {
      await updateMeta(contract, meta);
    } else {
      await upsertError(contract, 'mt', null);
    }
  } catch (error) {
    logger.error(`tokenMeta: updateMTMeta: ${contract}`);
    logger.error(error);
    await upsertError(contract, 'mt', null);
  }
};

const updateMeta = async (contract: string, meta: MTContractMetadata) => {
  const data = {
    modified_at: dayjs.utc().toISOString(),
    name: meta.name,
    spec: meta.spec,
  };

  try {
    await dbEvents('mt_meta').where('contract', contract).update(data);
  } catch (error) {
    logger.error(`tokenMeta: updateMeta: ${contract}`);
    logger.error(error);
  }
};

export const updateMTTokenMeta = async (contract: string, token: string) => {
  try {
    const meta = await fetchMTTokenMeta(contract, token);

    if (meta) {
      await updateTokenMeta(contract, token, meta);
    } else {
      await upsertError(contract, 'mt', token);
    }
  } catch (error) {
    logger.error(`tokenMeta: updateMTTokenMeta: ${contract}: ${token}`);
    logger.error(error);
    await upsertError(contract, 'mt', token);
  }
};

const updateTokenMeta = async (
  contract: string,
  token: string,
  meta: MTTokenMetadataInfo,
) => {
  const baseData = {
    base_uri: meta.base.base_uri,
    copies: meta.base.copies,
    decimals: meta.base.decimals,
    icon: meta.base.icon,
    modified_at: dayjs.utc().toISOString(),
    name: meta.base.name,
    reference: meta.base.reference,
    reference_hash: meta.base.reference_hash,
    symbol: meta.base.symbol,
  };
  const tokenData = {
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
    updated_at: meta.token.updated_at,
  };

  try {
    await dbEvents.transaction(async (tx) => {
      return Promise.all([
        tx('mt_base_meta')
          .where('contract', contract)
          .where('token', token)
          .update(baseData),
        tx('mt_token_meta')
          .where('contract', contract)
          .where('token', token)
          .update(tokenData),
      ]);
    });
  } catch (error) {
    logger.error(`tokenMeta: updateTokenMeta: ${contract}: ${token}`);
    logger.error(error);
  }
};

export const resetMTMeta = async (contracts: string[]) => {
  try {
    await dbEvents.transaction(async (tx) => {
      return Promise.all([
        tx.raw(
          `
            UPDATE mt_meta
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
          [contracts, 'mt'],
        ),
      ]);
    });
  } catch (error) {
    logger.error(`tokenMetaReset: resetMTMeta: ${contracts.join(',')}`);
    logger.error(error);
  }
};
