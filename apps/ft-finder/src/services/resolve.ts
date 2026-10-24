import { logger } from 'nb-logger';
import { RPC } from 'nb-near';

import { inferLayout } from '#services/layout';
import { hasFtMetadata, verifyLayout } from '#services/verify';
import { LayoutResult, Resolution, VerifyResult } from '#types/types';

const NOT_A_TOKEN: LayoutResult = {
  candidates: null,
  reason: 'ft_metadata not implemented, not a fungible token',
  unsupported: false,
};

export const resolveFamily = async (
  rpc: RPC,
  contract: string,
  blockHeight: number,
): Promise<Resolution> => {
  if (!(await hasFtMetadata(rpc, contract, blockHeight))) {
    return { layout: null, result: NOT_A_TOKEN, verifyResult: 'rejected' };
  }

  let result: LayoutResult;

  try {
    result = await inferLayout(rpc, contract, blockHeight);
  } catch (error) {
    const reason = `data_changes/RPC call failed: ${error}`;
    logger.warn(`${contract}: layout inference failed: ${reason}`);

    return {
      layout: null,
      result: { candidates: null, reason, unsupported: false },
      verifyResult: 'inconclusive',
    };
  }

  if (!result.candidates)
    return { layout: null, result, verifyResult: 'inconclusive' };

  const outcomes: VerifyResult[] = [];

  for (const candidate of result.candidates) {
    const verifyResult = await verifyLayout(
      rpc,
      contract,
      candidate.samples,
      candidate.blockHeight,
    );

    if (verifyResult === 'match')
      return { layout: candidate, result, verifyResult };

    outcomes.push(verifyResult);
  }

  if (outcomes.every((outcome) => outcome === 'rejected')) {
    return { layout: null, result, verifyResult: 'rejected' };
  }

  if (outcomes.includes('inconclusive')) {
    return { layout: null, result, verifyResult: 'inconclusive' };
  }

  return { layout: null, result, verifyResult: 'mismatch' };
};
