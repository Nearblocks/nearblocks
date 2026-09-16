import { logger } from 'nb-logger';

import dayjs from '#libs/dayjs';
import { upsertError } from '#libs/events';
import { dbEvents } from '#libs/knex';
import { fetchNFTMeta, fetchNFTTokenMeta } from '#libs/near';
import { isDataError } from '#libs/utils';
import {
  MetaContract,
  MetaContractToken,
  NFTMetadata,
  NFTTokenInfo,
  Raw,
} from '#types/types';

const TOKEN_META_SCAN_CURSOR_KEY = 'nft_token_meta_scan_cursor';
const TOKEN_META_CANDIDATE_BATCH = 3000;
const TOKEN_META_PROCESS_BATCH = 25;

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
          AND ec.attempts >= 3
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
        nft_meta nm
      WHERE
        modified_at < ?
        AND NOT EXISTS (
          SELECT
            1
          FROM
            errored_contracts ec
          WHERE
            nm.contract = ec.contract
            AND ec.type = 'nft'
            AND ec.token IS NULL
            AND ec.attempts >= 3
        )
      ORDER BY
        modified_at ASC
      LIMIT
        10
    `,
    [dayjs.utc().subtract(7, 'day').toISOString()],
  );

  await Promise.all(
    nfts.map(async (nft) => {
      const outcome = await fetchNFTMeta(nft.contract);

      if (outcome.ok) {
        await updateMeta(nft.contract, outcome.data);
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
  const cursorRow = await dbEvents('settings')
    .where('key', TOKEN_META_SCAN_CURSOR_KEY)
    .first();
  const cursor = cursorRow?.value as
    | { contract: string; token: string }
    | undefined;

  const { rows: batch } = await dbEvents.raw<
    Raw<MetaContractToken & { eligible: boolean }>
  >(
    `
      WITH candidates AS (
        SELECT
          contract,
          token
        FROM
          nft_token_meta
        WHERE
          modified_at IS NULL
          AND (
            ?::text IS NULL
            OR (contract, token) > (?::text, ?::text)
          )
        ORDER BY
          contract,
          token
        LIMIT
          ?
      )
      SELECT
        contract,
        token,
        NOT EXISTS (
          SELECT
            1
          FROM
            errored_contracts ec
          WHERE
            ec.contract = candidates.contract
            AND ec.type = 'nft'
            AND ec.token = candidates.token
            AND ec.attempts >= 3
        )
        AND NOT EXISTS (
          SELECT
            1
          FROM
            errored_contracts ec
          WHERE
            ec.contract = candidates.contract
            AND ec.type = 'nft'
            AND ec.token IS NULL
            AND ec.attempts >= 3
        ) AS eligible
      FROM
        candidates
      ORDER BY
        contract,
        token
    `,
    [
      cursor?.contract ?? null,
      cursor?.contract ?? null,
      cursor?.token ?? null,
      TOKEN_META_CANDIDATE_BATCH,
    ],
  );

  const last = batch[batch.length - 1];
  const nextCursor =
    batch.length < TOKEN_META_CANDIDATE_BATCH || !last
      ? {} // wrapped past the end of the table -- start over next run
      : { contract: last.contract, token: last.token };

  await dbEvents('settings')
    .insert({ key: TOKEN_META_SCAN_CURSOR_KEY, value: nextCursor })
    .onConflict('key')
    .merge();

  const nfts = batch
    .filter((row) => row.eligible)
    .slice(0, TOKEN_META_PROCESS_BATCH);

  await Promise.all(
    nfts.map((nft) => updateNFTTokenMeta(nft.contract, nft.token)),
  );
};

export const updateNFTMeta = async (contract: string) => {
  try {
    const outcome = await fetchNFTMeta(contract);

    if (outcome.ok) {
      await updateMeta(contract, outcome.data);
    } else {
      await upsertError(contract, 'nft', null, outcome.permanent);
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

    if (isDataError(error)) {
      await upsertError(contract, 'nft', null);
    }
  }
};

export const updateNFTTokenMeta = async (contract: string, token: string) => {
  try {
    const outcome = await fetchNFTTokenMeta(contract, token);

    if (outcome.ok) {
      await updateTokenMeta(contract, token, outcome.data);
    } else {
      await upsertError(contract, 'nft', token, outcome.permanent);
    }
  } catch (error) {
    logger.error(`nftTokenMeta: updateNFTTokenMeta: ${contract}: ${token}`);
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

    if (isDataError(error)) {
      await upsertError(contract, 'nft', token);
    }
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
