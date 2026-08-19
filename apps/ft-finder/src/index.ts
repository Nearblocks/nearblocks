import { logger } from 'nb-logger';
import { RPC } from 'nb-near';
import { sleep } from 'nb-utils';

import config from '#config';
import { destroyAll } from '#libs/knex';
import sentry from '#libs/sentry';
import { iterateCandidateBatches } from '#services/candidates';
import {
  buildFamilies,
  loadAlreadyResolvedContracts,
} from '#services/families';
import { assertArchival, inferLayout } from '#services/layout';
import { persistFamily } from '#services/seed';
import { hasFtMetadata, verifyLayout } from '#services/verify';
import { LayoutResult, Resolution, VerifyResult } from '#types/types';

const ARCHIVAL_PROBE_DEPTH = 500_000;
const ARCHIVAL_PROBE_ACCOUNT = 'ft-finder-archival-probe.near';

const NOT_A_TOKEN: LayoutResult = {
  candidates: null,
  reason: 'ft_metadata not implemented, not a fungible token',
  unsupported: false,
};

const resolveFamily = async (
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

const run = async (): Promise<void> => {
  logger.info({ network: config.network }, 'initializing ft finder...');

  const rpc = new RPC(config.rpcUrl);

  const headRes = await rpc.query({ finality: 'final' }, 'block');
  const headHeight = headRes.data?.result?.header?.height as number | undefined;

  if (!headHeight) {
    throw new Error('could not fetch head block height from RPC_URL');
  }

  logger.info(`running at head height ${headHeight}`);

  await assertArchival(
    rpc,
    ARCHIVAL_PROBE_ACCOUNT,
    Math.max(1, headHeight - ARCHIVAL_PROBE_DEPTH),
  );

  logger.info('archival rpc confirmed');

  const resolvedContracts = await loadAlreadyResolvedContracts();
  const resolvedByHash = new Map<string, Resolution>();

  const tally = { pending: 0, rejected: 0, unsupported: 0, verified: 0 };

  const write = async (
    family: Parameters<typeof persistFamily>[0],
    resolution: Resolution,
  ): Promise<void> => {
    const status = await persistFamily(
      family,
      resolution.layout,
      resolution.result,
      resolution.verifyResult,
    );

    tally[status] += family.contracts.length;
    for (const contract of family.contracts) resolvedContracts.add(contract);
  };

  const isDecisive = (resolution: Resolution): boolean =>
    resolution.verifyResult === 'match' ||
    resolution.verifyResult === 'rejected' ||
    (!resolution.result.candidates && resolution.result.unsupported);

  for await (const batch of iterateCandidateBatches()) {
    const families = await buildFamilies(
      batch.contracts,
      batch.bucketEnd,
      resolvedContracts,
    );

    for (const family of families) {
      const cached = family.codeHash
        ? resolvedByHash.get(family.codeHash)
        : undefined;

      if (cached) {
        await write(family, cached);
        continue;
      }

      const representative = family.contracts[0] as string;
      const resolution = await resolveFamily(
        rpc,
        representative,
        family.blockHeight,
      );

      if (family.codeHash && isDecisive(resolution)) {
        resolvedByHash.set(family.codeHash, resolution);
      }

      await write(family, resolution);

      if (config.rpcDelayMs) await sleep(config.rpcDelayMs);
    }
  }

  logger.info(
    `done, verified: ${tally.verified}, unsupported: ${tally.unsupported}, ` +
      `rejected: ${tally.rejected}, pending: ${tally.pending}`,
  );
};

run()
  .then(async () => {
    await destroyAll();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error('aborting...');
    logger.error(error);
    sentry.captureException(error);
    await Promise.all([destroyAll(), sentry.close(1_000)]);
    process.exit(1);
  });
