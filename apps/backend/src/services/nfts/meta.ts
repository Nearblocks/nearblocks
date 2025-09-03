import { viewFunctionAsJson } from '@near-js/jsonrpc-client/no-validation';

import { logger } from 'nb-logger';

import dayjs from '#libs/dayjs';
import { upsertError } from '#libs/events';
import { dbEvents, pgp } from '#libs/pgp';
import { rpc } from '#libs/rpc';
import { encodeArgs } from '#libs/utils';
import { NFTMetadata, NFTTokenInfo } from '#types/types';

export const syncNFTMeta = async () => {
  const nfts = await dbEvents.manyOrNone(`
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

export const syncNFTTokenMeta = async () => {
  const nfts = await dbEvents.manyOrNone(`
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
    const meta = await viewFunctionAsJson<NFTMetadata>(rpc, {
      accountId: contract,
      methodName: 'nft_metadata',
    });

    if (meta?.name) {
      const data = {
        base_uri: meta.base_uri,
        contract,
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
          table: 'nft_meta',
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
      await upsertError(contract, 'nft', null);
    }
  } catch (error) {
    logger.error(error);
    await upsertError(contract, 'nft', null);
  }
};

export const updateNFTTokenMeta = async (contract: string, token: string) => {
  try {
    const meta = await viewFunctionAsJson<NFTTokenInfo>(rpc, {
      accountId: contract,
      argsBase64: encodeArgs({ token_id: token }),
      methodName: 'nft_token',
    });

    if (meta?.metadata) {
      const data = {
        contract,
        copies: meta.metadata.copies,
        description: meta.metadata.description,
        extra: meta.metadata.extra,
        media: meta.metadata.media,
        media_hash: meta.metadata.media_hash,
        modified_at: dayjs.utc().toISOString(),
        reference: meta.metadata.reference,
        reference_hash: meta.metadata.reference_hash,
        title: meta.metadata.title,
        token,
      };

      try {
        const columns = new pgp.helpers.ColumnSet(Object.keys(data), {
          table: 'nft_token_meta',
        });

        await dbEvents.none(
          pgp.helpers.insert(data, columns) +
            ` ON CONFLICT (contract, token) DO UPDATE SET ` +
            columns.assignColumns({
              from: 'EXCLUDED',
              skip: ['contract', 'token'],
            }),
        );
      } catch (error) {
        logger.error(error);
      }
    } else {
      await upsertError(contract, 'nft', token);
    }
  } catch (error) {
    logger.error(error);
    await upsertError(contract, 'nft', token);
  }
};

export const syncExistingNFT = async () => {
  await dbEvents.manyOrNone(`
    INSERT INTO
      nft_meta (contract)
    SELECT DISTINCT
      contract_account_id
    FROM
      nft_events
    ON CONFLICT (contract) DO NOTHING
  `);
};

export const syncExistingNFTToken = async () => {
  await dbEvents.manyOrNone(`
    INSERT INTO
      nft_token_meta (contract, token)
    SELECT DISTINCT
      contract_account_id,
      token_id
    FROM
      nft_events
    ON CONFLICT (contract, token) DO NOTHING
  `);
};
