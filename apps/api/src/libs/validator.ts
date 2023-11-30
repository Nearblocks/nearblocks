import { ZodTypeAny } from 'zod';
import { merge } from 'lodash-es';
import { Response, NextFunction } from 'express';
import Big from 'big.js';
import { EpochValidatorInfo, RequestValidators, ValidatorEpochData, ValidatorSortFn } from '#ts/types';

const validator = <T extends ZodTypeAny>(schema: T) => {
  return (
    req: RequestValidators<typeof schema>,
    res: Response,
    next: NextFunction,
  ) => {
    const result = schema.safeParse(
      merge(req.body ?? {}, req.query ?? {}, req.params ?? {}),
    );

    if (!result.success) {
      return res.status(422).json({ errors: result.error.issues });
    }

    req.validator = result;

    return next();
  };
};

export default validator;


export const mapValidators = (
  epochStatus: EpochValidatorInfo,
  poolIds: string[]
): ValidatorEpochData[] => {
  // @ts-ignore
  const validatorsMap: Map<string, ValidatorEpochData> = new Map();

  for (const currentValidator of epochStatus.current_validators) {
    validatorsMap.set(currentValidator.account_id, {
      accountId: currentValidator.account_id,
      publicKey: currentValidator.public_key,
      currentEpoch: {
        stake: currentValidator.stake,
        progress: {
          blocks: {
            produced: currentValidator.num_produced_blocks,
            total: currentValidator.num_expected_blocks,
          },
          chunks: {
            produced: currentValidator.num_produced_chunks,
            total: currentValidator.num_expected_chunks,
          },
        },
      },
    });
  }

  for (const nextValidator of epochStatus.next_validators) {
    const validator = validatorsMap.get(nextValidator.account_id) || {
      accountId: nextValidator.account_id,
      publicKey: nextValidator.public_key,
    };
    validator.nextEpoch = {
      stake: nextValidator.stake,
    };
    validatorsMap.set(nextValidator.account_id, validator);
  }

  for (const nextProposal of epochStatus.current_proposals) {
    const validator = validatorsMap.get(nextProposal.account_id) || {
      accountId: nextProposal.account_id,
      publicKey: nextProposal.public_key,
    };
    validator.afterNextEpoch = {
      stake: nextProposal.stake,
    };
    validatorsMap.set(nextProposal.account_id, validator);
  }

  for (const accountId of poolIds) {
    const validator = validatorsMap.get(accountId) || {
      accountId,
    };
    validatorsMap.set(accountId, validator);
  }

  return [...validatorsMap.values()];
};

const sortByBNComparison = (aValue?: string, bValue?: string) => {
  const a = aValue ? new Big(aValue) : null;
  const b = bValue ? new Big(bValue) : null;

  if (a && b) {
    return a.cmp(b);
  }
  if (a) {
    return -1;
  }
  if (b) {
    return 1;
  }
  return 0;
};

export const validatorsSortFns: ValidatorSortFn[] = [
  (a, b) => sortByBNComparison(a.currentEpoch?.stake, b.currentEpoch?.stake),
  (a, b) => sortByBNComparison(a.nextEpoch?.stake, b.nextEpoch?.stake),
  (a, b) =>
    sortByBNComparison(a.afterNextEpoch?.stake, b.afterNextEpoch?.stake),
  (a, b) => sortByBNComparison(a.contractStake, b.contractStake),
];