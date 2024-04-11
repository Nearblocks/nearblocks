import { upsertErrorContract } from '#libs/contract';
import knex from '#libs/knex';
import { nftMeta, nftTokenMeta } from '#libs/near';

export const syncContracts = async () => {
  const contracts = await knex
    .select('contract_account_id')
    .from(
      knex
        .select('contract_account_id')
        .fromRaw('nft_events nft')
        .whereNotExists(
          knex
            .select(1)
            .fromRaw('errored_contracts e')
            .whereRaw('nft.contract_account_id = e.contract')
            .where('type', 'nft')
            .whereNull('token')
            .where('attempts', '>=', 5),
        )
        .groupBy('contract_account_id')
        .as('nft'),
    )
    .whereNotExists(
      knex
        .select('*')
        .fromRaw('nft_meta m')
        .whereRaw('nft.contract_account_id = m.contract'),
    )
    .limit(10);

  await Promise.all(
    contracts.map((contract) => updateContract(contract.contract_account_id)),
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
  const tokens = await knex
    .select('contract_account_id', 'token_id')
    .from(
      knex
        .select('contract_account_id', 'token_id')
        .fromRaw('nft_events nft')
        .whereNotExists(
          knex
            .select(1)
            .fromRaw('errored_contracts e')
            .whereRaw('nft.contract_account_id = e.contract')
            .whereRaw('nft.token_id = e.token')
            .where('type', 'nft')
            .where('attempts', '>=', 5),
        )
        .groupBy('contract_account_id', 'token_id')
        .as('nft'),
    )
    .whereNotExists(
      knex
        .select(1)
        .fromRaw('nft_token_meta n')
        .whereRaw('nft.contract_account_id = n.contract')
        .whereRaw('nft.token_id = n.token'),
    )
    .limit(100);

  await Promise.all(
    tokens.map((token) =>
      updateToken(token.contract_account_id, token.token_id),
    ),
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
