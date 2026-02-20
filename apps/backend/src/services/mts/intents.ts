import { logger } from 'nb-logger';
import {
  FTMeta,
  MTBaseMeta,
  MTTokenMeta,
  NFTMeta,
  NFTTokenMeta,
} from 'nb-types';

import dayjs from '#libs/dayjs';
import { dbEvents } from '#libs/knex';
import {
  fetchFTMeta,
  fetchMTTokenMeta,
  fetchNFTMeta,
  fetchNFTTokenMeta,
} from '#libs/near';
import { FTMetadata, NFTMetadata, NFTTokenMetadata, Raw } from '#types/types';

type TokenPattern =
  | { sourceContract: string; sourceToken: string; type: 'nep171' }
  | { sourceContract: string; sourceToken: string; type: 'nep245' }
  | { sourceContract: string; type: 'nep141' }
  | null;

const parseTokenPattern = (token: string): TokenPattern => {
  const regex = /^(nep141|nep171|nep245):([^:]+)(?::(.+))?$/;
  const match = token.match(regex);

  if (!match) return null;

  const [, type, sourceContract, sourceToken] = match;

  if (type === 'nep141' && sourceToken) return null;
  if (type !== 'nep141' && !sourceToken) return null;

  return sourceToken
    ? { sourceContract, sourceToken, type: type as 'nep171' | 'nep245' }
    : { sourceContract, type: 'nep141' };
};

const toStr = (val: null | number | string | undefined): null | string =>
  val !== null && val !== undefined ? String(val) : null;

const copyFromFTMeta = async (
  contract: string,
  token: string,
  sourceContract: string,
): Promise<boolean> => {
  const { rows } = await dbEvents.raw<Raw<FTMeta>>(
    `
      SELECT
        *
      FROM
        ft_meta
      WHERE
        contract = ?
        AND modified_at IS NOT NULL
      LIMIT
        1
    `,
    [sourceContract],
  );

  const source: FTMeta | FTMetadata | null = rows.length
    ? rows[0]
    : await fetchFTMeta(sourceContract);

  if (!source) return false;

  const now = dayjs.utc().toISOString();

  await dbEvents.transaction(async (tx) => {
    return Promise.all([
      tx('mt_base_meta')
        .where('contract', contract)
        .where('token', token)
        .update({
          base_uri: null,
          copies: null,
          decimals: source.decimals,
          icon: source.icon,
          modified_at: now,
          name: source.name,
          reference: source.reference,
          reference_hash: source.reference_hash,
          symbol: source.symbol,
        }),
      tx('mt_token_meta')
        .where('contract', contract)
        .where('token', token)
        .update({
          copies: null,
          description: null,
          expires_at: null,
          extra: null,
          issued_at: null,
          media: null,
          media_hash: null,
          modified_at: now,
          reference: null,
          reference_hash: null,
          starts_at: null,
          title: null,
          updated_at: null,
        }),
    ]);
  });

  return true;
};

const writeNFTToMT = async (
  contract: string,
  token: string,
  base: NFTMeta | NFTMetadata,
  tkn: NFTTokenMeta | NFTTokenMetadata,
) => {
  const now = dayjs.utc().toISOString();

  await dbEvents.transaction(async (tx) => {
    return Promise.all([
      tx('mt_base_meta')
        .where('contract', contract)
        .where('token', token)
        .update({
          base_uri: base.base_uri,
          copies: null,
          decimals: null,
          icon: base.icon,
          modified_at: now,
          name: base.name,
          reference: base.reference,
          reference_hash: base.reference_hash,
          symbol: base.symbol,
        }),
      tx('mt_token_meta')
        .where('contract', contract)
        .where('token', token)
        .update({
          copies: toStr(tkn.copies),
          description: tkn.description,
          expires_at: toStr(tkn.expires_at),
          extra: tkn.extra,
          issued_at: toStr(tkn.issued_at),
          media: tkn.media,
          media_hash: tkn.media_hash,
          modified_at: now,
          reference: tkn.reference,
          reference_hash: tkn.reference_hash,
          starts_at: toStr(tkn.starts_at),
          title: tkn.title,
          updated_at: toStr(tkn.updated_at),
        }),
    ]);
  });
};

const copyFromNFTMeta = async (
  contract: string,
  token: string,
  sourceContract: string,
  sourceToken: string,
): Promise<boolean> => {
  const [{ rows: baseMeta }, { rows: tokenMeta }] = await Promise.all([
    dbEvents.raw<Raw<NFTMeta>>(
      `
        SELECT
          *
        FROM
          nft_meta
        WHERE
          contract = ?
          AND modified_at IS NOT NULL
        LIMIT
          1
      `,
      [sourceContract],
    ),
    dbEvents.raw<Raw<NFTTokenMeta>>(
      `
        SELECT
          *
        FROM
          nft_token_meta
        WHERE
          contract = ?
          AND token = ?
          AND modified_at IS NOT NULL
        LIMIT
          1
      `,
      [sourceContract, sourceToken],
    ),
  ]);

  if (baseMeta.length && tokenMeta.length) {
    await writeNFTToMT(contract, token, baseMeta[0], tokenMeta[0]);
    return true;
  }

  const [rpcBase, rpcToken] = await Promise.all([
    fetchNFTMeta(sourceContract),
    fetchNFTTokenMeta(sourceContract, sourceToken),
  ]);

  if (!rpcBase || !rpcToken) return false;

  await writeNFTToMT(contract, token, rpcBase, rpcToken.metadata);
  return true;
};

const copyFromMTMeta = async (
  contract: string,
  token: string,
  sourceContract: string,
  sourceToken: string,
): Promise<boolean> => {
  const [{ rows: baseMeta }, { rows: tokenMeta }] = await Promise.all([
    dbEvents.raw<Raw<MTBaseMeta>>(
      `
        SELECT
          *
        FROM
          mt_base_meta
        WHERE
          contract = ?
          AND token = ?
          AND modified_at IS NOT NULL
        LIMIT
          1
      `,
      [sourceContract, sourceToken],
    ),
    dbEvents.raw<Raw<MTTokenMeta>>(
      `
        SELECT
          *
        FROM
          mt_token_meta
        WHERE
          contract = ?
          AND token = ?
          AND modified_at IS NOT NULL
        LIMIT
          1
      `,
      [sourceContract, sourceToken],
    ),
  ]);

  if (baseMeta.length && tokenMeta.length) {
    const base = baseMeta[0];
    const tkn = tokenMeta[0];
    const now = dayjs.utc().toISOString();

    await dbEvents.transaction(async (tx) => {
      return Promise.all([
        tx('mt_base_meta')
          .where('contract', contract)
          .where('token', token)
          .update({
            base_uri: base.base_uri,
            copies: base.copies,
            decimals: base.decimals,
            icon: base.icon,
            modified_at: now,
            name: base.name,
            reference: base.reference,
            reference_hash: base.reference_hash,
            symbol: base.symbol,
          }),
        tx('mt_token_meta')
          .where('contract', contract)
          .where('token', token)
          .update({
            copies: tkn.copies,
            description: tkn.description,
            expires_at: tkn.expires_at,
            extra: tkn.extra,
            issued_at: tkn.issued_at,
            media: tkn.media,
            media_hash: tkn.media_hash,
            modified_at: now,
            reference: tkn.reference,
            reference_hash: tkn.reference_hash,
            starts_at: tkn.starts_at,
            title: tkn.title,
            updated_at: tkn.updated_at,
          }),
      ]);
    });

    return true;
  }

  const meta = await fetchMTTokenMeta(sourceContract, sourceToken);

  if (!meta) return false;

  const now = dayjs.utc().toISOString();

  await dbEvents.transaction(async (tx) => {
    return Promise.all([
      tx('mt_base_meta')
        .where('contract', contract)
        .where('token', token)
        .update({
          base_uri: meta.base.base_uri,
          copies: meta.base.copies,
          decimals: meta.base.decimals,
          icon: meta.base.icon,
          modified_at: now,
          name: meta.base.name,
          reference: meta.base.reference,
          reference_hash: meta.base.reference_hash,
          symbol: meta.base.symbol,
        }),
      tx('mt_token_meta')
        .where('contract', contract)
        .where('token', token)
        .update({
          copies: null,
          description: meta.token.description,
          expires_at: meta.token.expires_at,
          extra: meta.token.extra,
          issued_at: meta.token.issued_at,
          media: meta.token.media,
          media_hash: meta.token.media_hash,
          modified_at: now,
          reference: meta.token.reference,
          reference_hash: meta.token.reference_hash,
          starts_at: meta.token.starts_at,
          title: meta.token.title,
          updated_at: meta.token.updated_at,
        }),
    ]);
  });

  return true;
};

export const copyExternalTokenMeta = async (
  contract: string,
  token: string,
): Promise<boolean> => {
  const pattern = parseTokenPattern(token);

  if (!pattern) return false;

  try {
    if (pattern.type === 'nep141') {
      return await copyFromFTMeta(contract, token, pattern.sourceContract);
    }

    if (pattern.type === 'nep171') {
      return await copyFromNFTMeta(
        contract,
        token,
        pattern.sourceContract,
        pattern.sourceToken,
      );
    }

    if (pattern.type === 'nep245') {
      return await copyFromMTMeta(
        contract,
        token,
        pattern.sourceContract,
        pattern.sourceToken,
      );
    }
  } catch (error) {
    logger.error(`tokenMeta: copyExternalTokenMeta: ${contract}: ${token}`);
    logger.error(error);
    return false;
  }

  return false;
};
