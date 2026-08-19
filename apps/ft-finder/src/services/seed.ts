import { logger } from 'nb-logger';
import { FTContractLayout, FTContractLayoutStatus } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { dbEvents } from '#libs/knex';
import { chunks } from '#libs/utils';
import {
  CodeHashFamily,
  InferredLayout,
  LayoutResult,
  VerifyResult,
} from '#types/types';

const statusFor = (verifyResult: VerifyResult): FTContractLayoutStatus => {
  switch (verifyResult) {
    case 'match':
      return 'verified';
    case 'rejected':
      return 'rejected';
    case 'mismatch':
      return 'unsupported';
    case 'inconclusive':
      return 'pending';
  }
};

const noteFor = (
  layout: InferredLayout | null,
  result: LayoutResult,
  verifyResult: VerifyResult,
): null | string => {
  if (layout) return null;
  if (!result.candidates) return result.reason;
  if (verifyResult === 'rejected') return 'ft_balance_of missing or reverted';
  if (verifyResult === 'mismatch') {
    return `none of ${result.candidates.length} candidate prefixes matched ft_balance_of`;
  }
  return 'ft_balance_of probe inconclusive, retry next run';
};

export const persistFamily = async (
  family: CodeHashFamily,
  layout: InferredLayout | null,
  result: LayoutResult,
  verifyResult: VerifyResult,
): Promise<FTContractLayoutStatus> => {
  const status = result.candidates
    ? statusFor(verifyResult)
    : result.unsupported
    ? 'unsupported'
    : statusFor(verifyResult);
  const note = noteFor(layout, result, verifyResult);
  const observations =
    layout?.samples.length ?? result.candidates?.[0]?.samples.length ?? 0;

  const rows: FTContractLayout[] = family.contracts.map((contract) => ({
    account_offset: layout ? layout.accountOffset : null,
    account_path: layout ? layout.accountPath : null,
    code_hash: family.codeHash,
    contract,
    discovered_at_height: layout?.blockHeight ?? family.blockHeight,
    key_encoding: layout ? layout.keyEncoding : null,
    key_prefix: layout ? layout.prefix : null,
    note,
    observations,
    probed_at: family.blockHeight,
    status,
    value_encoding: layout ? layout.valueEncoding : null,
    value_offset: layout ? layout.valueOffset : null,
    value_path: layout ? layout.valuePath : null,
    verified_at_height: layout ? layout.blockHeight : null,
  }));

  await retry(async () => {
    for (const batch of chunks(rows, config.insertLimit)) {
      await dbEvents('ft_contract_layouts')
        .insert(batch)
        .onConflict('contract')
        .merge([
          'account_offset',
          'account_path',
          'code_hash',
          'discovered_at_height',
          'key_encoding',
          'key_prefix',
          'note',
          'observations',
          'probed_at',
          'status',
          'value_encoding',
          'value_offset',
          'value_path',
          'verified_at_height',
        ]);
    }
  });

  if (status === 'verified') {
    await retry(async () => {
      for (const batch of chunks(family.contracts, config.insertLimit)) {
        await dbEvents('ft_meta')
          .insert(batch.map((contract) => ({ contract })))
          .onConflict('contract')
          .ignore();
      }
    });
  }

  logger.info(
    `${family.codeHash ?? 'no code_hash'}: ${
      family.contracts.length
    } contracts ${status}`,
  );

  return status;
};
