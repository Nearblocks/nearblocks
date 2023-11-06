import { upsertErrorEntry } from '#libs/contract';
import knex from '#libs/knex';
import { nftMeta, nftTokenMeta } from '#libs/near';

export const unSyncedContracts = async () => {
  return knex
    .select('emitted_by_contract_account_id')
    .from(
      knex
        .select('emitted_by_contract_account_id')
        .fromRaw('assets__non_fungible_token_events a')
        .whereNotExists(
          knex
            .select(1)
            .fromRaw('error_contracts e')
            .whereRaw('a.emitted_by_contract_account_id = e.contract')
            .where('type', 'nft')
            .whereNull('token')
            .where('attempts', '>=', 5),
        )
        .groupBy('emitted_by_contract_account_id')
        .as('a'),
    )
    .whereNotExists(
      knex
        .select('*')
        .fromRaw('nft_meta n')
        .whereRaw('a.emitted_by_contract_account_id = n.contract'),
    )
    .limit(10);
};

export const unSyncedTokens = async () => {
  return knex
    .select('emitted_by_contract_account_id', 'token_id')
    .from(
      knex
        .select('emitted_by_contract_account_id', 'token_id')
        .fromRaw('assets__non_fungible_token_events a')
        .whereNotExists(
          knex
            .select(1)
            .fromRaw('error_contracts e')
            .whereRaw('a.emitted_by_contract_account_id = e.contract')
            .whereRaw('a.token_id = e.token')
            .where('type', 'nft')
            .where('attempts', '>=', 5),
        )
        .groupBy('emitted_by_contract_account_id', 'token_id')
        .as('a'),
    )
    .whereNotExists(
      knex
        .select(1)
        .fromRaw('nft_token_meta n')
        .whereRaw('a.emitted_by_contract_account_id = n.contract')
        .whereRaw('a.token_id = n.token'),
    )
    .limit(25);
};

export const syncMeta = async (contract: string) => {
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

    return upsertErrorEntry(contract, 'nft', null);
  } catch (error) {
    return upsertErrorEntry(contract, 'nft', null);
  }
};

export const syncTokenMeta = async (contract: string, token: string) => {
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

    return upsertErrorEntry(contract, 'nft', token);
  } catch (error) {
    return upsertErrorEntry(contract, 'nft', token);
  }
};
