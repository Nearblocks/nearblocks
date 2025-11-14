import { logger } from 'nb-logger';

import dayjs from '#libs/dayjs';
import { upsertError } from '#libs/events';
import { dbEvents } from '#libs/knex';
import { fetchNFTMeta, fetchNFTTokenMeta } from '#libs/near';
import {
  MetaContract,
  MetaContractToken,
  NFTMetadata,
  NFTTokenInfo,
  Raw,
} from '#types/types';

export const syncNFTMeta = async () => {
  const { rows: nfts } = await dbEvents.raw<Raw<MetaContract>>(`
    SELECT
      contract
    FROM
      nft_meta nm
    WHERE
      nm.modified_at IS NULL
      AND NOT EXISTS (
        SELECT
          1
        FROM
          errored_contracts ec
        WHERE
          nm.contract = ec.contract
          AND ec.type = 'nft'
          AND ec.token IS NULL
          AND ec.attempts >= 5
      )
    LIMIT
      5
  `);

  await Promise.all(nfts.map((nft) => updateNFTMeta(nft.contract)));
};

export const refreshNFTMeta = async () => {
  const { rows: nfts } = await dbEvents.raw<Raw<MetaContract>>(
    `
      SELECT
        contract
      FROM
        nft_meta
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
    nfts.map(async (nft) => {
      const meta = await fetchNFTMeta(nft.contract);

      if (meta) {
        await updateMeta(nft.contract, meta);
      } else {
        await dbEvents.raw(
          `
            UPDATE nft_meta
            SET
              modified_at = ?
            WHERE
              contract = ?
          `,
          [dayjs.utc().toISOString(), nft.contract],
        );
      }
    }),
  );
};

export const syncNFTTokenMeta = async () => {
  const { rows: nfts } = await dbEvents.raw<Raw<MetaContractToken>>(`
    SELECT
      contract,
      token
    FROM
      nft_token_meta ntm
    WHERE
      ntm.modified_at IS NULL
      AND NOT EXISTS (
        SELECT
          1
        FROM
          errored_contracts ec
        WHERE
          ntm.contract = ec.contract
          AND ec.type = 'nft'
          AND ntm.token = ec.token
          AND ec.attempts >= 5
      )
    LIMIT
      25
  `);

  await Promise.all(
    nfts.map((nft) => updateNFTTokenMeta(nft.contract, nft.token)),
  );
};

export const updateNFTMeta = async (contract: string) => {
  try {
    const meta = await fetchNFTMeta(contract);

    if (meta) {
      await updateMeta(contract, meta);
    } else {
      await upsertError(contract, 'nft', null);
    }
  } catch (error) {
    logger.error(`tokenMeta: updateNFTMeta: ${contract}`);
    logger.error(error);
    await upsertError(contract, 'nft', null);
  }
};

const updateMeta = async (contract: string, meta: NFTMetadata) => {
  const data = {
    base_uri: meta.base_uri,
    icon: meta.icon,
    modified_at: dayjs.utc().toISOString(),
    name: meta.name,
    reference: meta.reference,
    reference_hash: meta.reference_hash,
    spec: meta.spec,
    symbol: meta.symbol,
  };

  try {
    await dbEvents('nft_meta').where('contract', contract).update(data);
  } catch (error) {
    logger.error(`tokenMeta: updateMeta: ${contract}`);
    logger.error(error);
  }
};

export const updateNFTTokenMeta = async (contract: string, token: string) => {
  try {
    const meta = await fetchNFTTokenMeta(contract, token);

    if (meta) {
      await updateTokenMeta(contract, token, meta);
    } else {
      await upsertError(contract, 'nft', token);
    }
  } catch (error) {
    logger.error(`tokenMeta: updateNFTTokenMeta: ${contract}: ${token}`);
    logger.error(error);
    await upsertError(contract, 'nft', token);
  }
};

const updateTokenMeta = async (
  contract: string,
  token: string,
  meta: NFTTokenInfo,
) => {
  const data = {
    copies: meta.metadata.copies,
    description: meta.metadata.description,
    extra: meta.metadata.extra,
    media: meta.metadata.media,
    media_hash: meta.metadata.media_hash,
    modified_at: dayjs.utc().toISOString(),
    reference: meta.metadata.reference,
    reference_hash: meta.metadata.reference_hash,
    title: meta.metadata.title,
  };

  try {
    await dbEvents('nft_token_meta')
      .where('contract', contract)
      .where('token', token)
      .update(data);
  } catch (error) {
    logger.error(`tokenMeta: updateTokenMeta: ${contract}: ${token}`);
    logger.error(error);
  }
};

export const resetNFTMeta = async (contracts: string[]) => {
  try {
    await dbEvents.transaction(async (tx) => {
      return Promise.all([
        tx.raw(
          `
            UPDATE nft_meta
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
          [contracts, 'nft'],
        ),
      ]);
    });
  } catch (error) {
    logger.error(`tokenMetaReset: resetNFTMeta: ${contracts.join(',')}`);
    logger.error(error);
  }
};
