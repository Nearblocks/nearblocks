import { logger } from 'nb-logger';
import { RPC } from 'nb-near';
import { retry } from 'nb-utils';

import { LayoutSample, VerifyResult, ViewCall } from '#types/types';

const REJECT_MARKERS = [
  'methodnotfound',
  'methodresolveerror',
  'compilationerror',
  'wasmerruntimeerror',
  'functioncallerror',
  'contract_execution_error',
  'codedoesnotexist',
  'unknown_account',
  'no_contract_code',
];

const ABSENT_MARKERS = [
  'methodnotfound',
  'methodresolveerror',
  'codedoesnotexist',
  'unknown_account',
  'no_contract_code',
];

const callView = async (
  rpc: RPC,
  contract: string,
  method: string,
  args: unknown,
  blockHeight: number,
): Promise<ViewCall> => {
  try {
    const res = await retry(
      () =>
        rpc.callFunction(contract, method, rpc.encodeArgs(args), blockHeight),
      { exponential: true, retries: 5 },
    );

    const data = res.data as {
      error?: { cause?: { name?: string }; message?: string };
      result?: { error?: string; result?: number[] };
    };

    if (data?.result?.result)
      return { errorName: '', result: data.result.result };

    const errorName = String(
      data?.result?.error ||
        data?.error?.cause?.name ||
        data?.error?.message ||
        '',
    ).toLowerCase();

    return { errorName, result: null };
  } catch (error) {
    logger.warn({ err: error }, `${contract}: ${method} failed`);
    return { errorName: '', result: null };
  }
};

export const hasFtMetadata = async (
  rpc: RPC,
  contract: string,
  blockHeight: number,
): Promise<boolean> => {
  const { errorName } = await callView(
    rpc,
    contract,
    'ft_metadata',
    {},
    blockHeight,
  );

  return !ABSENT_MARKERS.some((marker) => errorName.includes(marker));
};

export const fetchBalance = async (
  rpc: RPC,
  contract: string,
  account: string,
  blockHeight: number,
): Promise<bigint | null> => {
  const { result } = await callView(
    rpc,
    contract,
    'ft_balance_of',
    { account_id: account },
    blockHeight,
  );

  if (!result) return null;

  try {
    return BigInt(JSON.parse(Buffer.from(result).toString()));
  } catch {
    return null;
  }
};

const probeOne = async (
  rpc: RPC,
  contract: string,
  sample: LayoutSample,
  blockHeight: number,
): Promise<VerifyResult> => {
  const { errorName, result } = await callView(
    rpc,
    contract,
    'ft_balance_of',
    { account_id: sample.account },
    blockHeight,
  );

  if (result) {
    try {
      const balance = BigInt(JSON.parse(Buffer.from(result).toString()));
      return balance === sample.amount ? 'match' : 'mismatch';
    } catch {
      return 'inconclusive';
    }
  }

  if (REJECT_MARKERS.some((marker) => errorName.includes(marker)))
    return 'rejected';

  return 'inconclusive';
};

export const verifyLayout = async (
  rpc: RPC,
  contract: string,
  samples: LayoutSample[],
  blockHeight: number,
): Promise<VerifyResult> => {
  if (!samples.length) return 'inconclusive';

  const outcomes: VerifyResult[] = [];

  for (const sample of samples) {
    outcomes.push(await probeOne(rpc, contract, sample, blockHeight));
  }

  if (outcomes.every((outcome) => outcome === 'rejected')) return 'rejected';
  if (outcomes.every((outcome) => outcome === 'match')) return 'match';
  if (outcomes.some((outcome) => outcome === 'mismatch')) return 'mismatch';

  return 'inconclusive';
};
