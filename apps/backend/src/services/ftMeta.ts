import { upsertErrorEntry } from '#libs/contract';
import dayjs from '#libs/dayjs';
import knex from '#libs/knex';
import { ftMeta } from '#libs/near';

export const unSyncedTokens = async () => {
  return knex
    .select('emitted_by_contract_account_id')
    .from(
      knex
        .select('emitted_by_contract_account_id')
        .fromRaw('assets__fungible_token_events a')
        .whereNotExists(
          knex
            .select(1)
            .fromRaw('error_contracts e')
            .whereRaw('a.emitted_by_contract_account_id = e.contract')
            .where('type', 'ft')
            .where('attempts', '>=', 5),
        )
        .groupBy('emitted_by_contract_account_id')
        .as('a'),
    )
    .whereNotExists(
      knex
        .select('*')
        .from('ft_meta')
        .whereRaw('a.emitted_by_contract_account_id = ft_meta.contract'),
    )
    .limit(10);
};

export const syncMeta = async (contract: string) => {
  try {
    const meta = await ftMeta(contract);

    if (meta?.name && meta?.symbol) {
      return knex('ft_meta')
        .insert({
          contract,
          decimals: meta.decimals,
          icon: meta.icon || null,
          name: meta.name,
          reference: meta.reference || null,
          reference_hash: meta.reference_hash || null,
          spec: meta.spec,
          symbol: meta.symbol,
          updated_at: dayjs.utc().toISOString(),
        })
        .onConflict('contract')
        .ignore();
    }

    return upsertErrorEntry(contract, 'ft', null);
  } catch (error) {
    return upsertErrorEntry(contract, 'ft', null);
  }
};
