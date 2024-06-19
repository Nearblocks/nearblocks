import { upsertErrorContract } from '#libs/contract';
import knex from '#libs/knex';
import { nftMeta, nftTokenMeta } from '#libs/near';

type RawResp<T> = {
  rows: T[];
};

type ContractResp = {
  contract: string;
};

type ContractTokenResp = {
  contract: string;
  token: string;
};

export const syncContracts = async () => {
  const contracts = await knex.raw<RawResp<ContractResp>>(
    `
      SELECT
        contract_account_id AS contract
      FROM
        (
          SELECT
            contract_account_id
          FROM
            (
              SELECT DISTINCT
                contract_account_id
              FROM
                nft_events
            ) nft
          WHERE
            NOT EXISTS (
              SELECT
                1
              FROM
                errored_contracts e
              WHERE
                nft.contract_account_id = e.contract
                AND e.type = 'nft'
                AND e.token IS NULL
                AND e.attempts >= 5
            )
        ) AS nft
      WHERE
        NOT EXISTS (
          SELECT
            1
          FROM
            nft_meta m
          WHERE
            nft.contract_account_id = m.contract
        )
      LIMIT
        10;
    `,
  );

  await Promise.all(
    contracts?.rows.map((contract) => updateContract(contract.contract)),
  );
};

const updateContract = async (contract: string) => {
  try {
    const meta = await nftMeta(contract);

    if (meta?.name && meta?.symbol) {
      return knex('nft_meta')
        .insert({
          base_uri: meta.base_uri || null,
          contract,
          icon: meta.icon || null,
          name: meta.name,
          reference: meta.reference || null,
          reference_hash: meta.reference_hash || null,
          spec: meta.spec || null,
          symbol: meta.symbol,
        })
        .onConflict('contract')
        .ignore();
    }
  } catch (error) {
    //
  }

  return upsertErrorContract(contract, 'nft', null);
};

export const syncTokens = async () => {
  const tokens = await knex.raw<RawResp<ContractTokenResp>>(
    `
      SELECT
        contract_account_id AS contract,
        token_id AS token
      FROM
        (
          SELECT
            contract_account_id,
            token_id
          FROM
            (
              SELECT DISTINCT
                contract_account_id,
                token_id
              FROM
                nft_events
              GROUP BY
                contract_account_id,
                token_id
            ) nft
          WHERE
            NOT EXISTS (
              SELECT
                1
              FROM
                errored_contracts e
              WHERE
                nft.contract_account_id = e.contract
                AND nft.token_id = e.token
                AND e.type = 'nft'
                AND e.attempts >= 5
            )
        ) AS nft
      WHERE
        NOT EXISTS (
          SELECT
            1
          FROM
            nft_token_meta n
          WHERE
            nft.contract_account_id = n.contract
            AND nft.token_id = n.token
        )
      LIMIT
        100;
    `,
  );

  await Promise.all(
    tokens?.rows.map((token) => updateToken(token.contract, token.token)),
  );
};

const updateToken = async (contract: string, token: string) => {
  try {
    const meta = await nftTokenMeta(contract, token);

    if (meta?.metadata) {
      return knex('nft_token_meta')
        .insert({
          contract,
          copies: meta.metadata.copies || null,
          description: meta.metadata.description || null,
          extra: meta.metadata.extra || null,
          media: meta.metadata.media || null,
          media_hash: meta.metadata.media_hash || null,
          reference: meta.metadata.reference || null,
          reference_hash: meta.metadata.reference_hash || null,
          title: meta.metadata.title || null,
          token,
        })
        .onConflict(['contract', 'token'])
        .ignore();
    }
  } catch (error) {
    //
  }

  return upsertErrorContract(contract, 'nft', token);
};
