import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import { checkArchival, fetchBalance, REJECT_MARKERS, RPC } from 'nb-near';
import { Network } from 'nb-types';
import { sleep } from 'nb-utils';

import config from '#config';
import { audit } from '#libs/prom';
import sentry from '#libs/sentry';
import { markUntracked } from '#services/detect';
import {
  claimNext,
  drawSamples,
  recordVerdict,
  syncRoster,
} from '#services/roster';
import { Sample, VerificationRow, VerifyStatus } from '#types/types';

const ARCHIVAL_PROBE_DEPTH = 500_000;
const ARCHIVAL_PROBE_ACCOUNT =
  config.network === Network.MAINNET
    ? 'ft-state-audit-probe.near'
    : 'ft-state-audit-probe.testnet';

type SampleOutcome = 'inconclusive' | 'match' | 'mismatch' | 'rejected';

const headHeight = async (rpc: RPC): Promise<number> => {
  const res = await rpc.query({ finality: 'final' }, 'block');
  const height = (res.data as { result?: { header?: { height?: number } } })
    ?.result?.header?.height;

  if (!height)
    throw new Error('could not fetch head block height from RPC_URL');

  return height;
};

const probeSample = async (
  rpc: RPC,
  contract: string,
  sample: Sample,
): Promise<SampleOutcome> => {
  const { balance, errorName } = await fetchBalance(
    rpc,
    contract,
    sample.account,
    sample.blockHeight,
  );

  audit.rpcCallsTotal.inc();

  if (balance !== null) return balance === sample.amount ? 'match' : 'mismatch';
  if (REJECT_MARKERS.some((marker) => errorName.includes(marker)))
    return 'rejected';

  return 'inconclusive';
};

const probeAll = async (
  rpc: RPC,
  contract: string,
  samples: Sample[],
): Promise<SampleOutcome[]> => {
  const outcomes: SampleOutcome[] = [];

  for (const sample of samples) {
    // eslint-disable-next-line no-await-in-loop
    outcomes.push(await probeSample(rpc, contract, sample));
  }

  return outcomes;
};

const verdictFor = (
  outcomes: SampleOutcome[],
): 'ambiguous' | 'inconclusive' | 'match' | 'mismatch' | 'rejected' => {
  const mismatches = outcomes.filter((o) => o === 'mismatch').length;
  const rejects = outcomes.filter((o) => o === 'rejected').length;
  const matches = outcomes.filter((o) => o === 'match').length;

  if (rejects === outcomes.length) return 'rejected';
  if (mismatches >= 2) return 'mismatch';
  if (mismatches === 1) return 'ambiguous';
  if (matches === outcomes.length) return 'match';

  return 'inconclusive';
};

const tally = (outcomes: SampleOutcome[]) => ({
  matched: outcomes.filter((o) => o === 'match').length,
  mismatched: outcomes.filter((o) => o === 'mismatch').length,
});

const finish = async (
  db: Knex,
  job: VerificationRow,
  samples: Sample[],
  outcomes: SampleOutcome[],
  status: VerifyStatus,
  untrackReason?: 'not_ft' | 'rpc_mismatch',
): Promise<void> => {
  const { matched, mismatched } = tally(outcomes);
  const blockHeight = samples.reduce(
    (max, sample) => Math.max(max, sample.blockHeight),
    job.block_height,
  );

  if (untrackReason) {
    await markUntracked(db, job.contract, blockHeight, untrackReason);
  }

  await recordVerdict(db, job.contract, {
    attempts: 0,
    blockHeight,
    matched,
    mismatched,
    samples: samples.length,
    status,
  });

  audit.auditsTotal.inc({ status });

  logger.info(
    `ft state audit: ${job.contract}: ${status}` +
      (untrackReason ? ` (${untrackReason})` : ''),
  );
};

const inconclusive = async (
  db: Knex,
  job: VerificationRow,
  samples: Sample[],
  outcomes: SampleOutcome[],
): Promise<void> => {
  const { matched, mismatched } = tally(outcomes);

  await recordVerdict(db, job.contract, {
    attempts: job.attempts + 1,
    blockHeight: job.block_height,
    matched,
    mismatched,
    samples: samples.length,
    status: 'inconclusive',
  });

  audit.auditsTotal.inc({ status: 'inconclusive' });
};

const tick = async (db: Knex, rpc: RPC): Promise<void> => {
  const job = await claimNext(db);
  if (!job) return;

  const settings = await db('settings').where('key', config.indexerKey).first();
  const syncHeight = Number(settings?.value?.sync ?? 0);

  if (!syncHeight) return;

  const maxHeight = syncHeight - config.verifyMinLagBlocks;

  const round1 = await drawSamples(
    db,
    job.contract,
    maxHeight,
    config.verifySamples,
    new Set(),
  );

  if (round1.length < 2) {
    await recordVerdict(db, job.contract, {
      attempts: job.attempts,
      blockHeight: job.block_height,
      matched: 0,
      mismatched: 0,
      samples: round1.length,
      status: 'skipped',
    });
    audit.auditsTotal.inc({ status: 'skipped' });
    return;
  }

  const outcomes1 = await probeAll(rpc, job.contract, round1);
  const verdict1 = verdictFor(outcomes1);

  if (verdict1 === 'match')
    return finish(db, job, round1, outcomes1, 'verified');
  if (verdict1 === 'mismatch') {
    return finish(db, job, round1, outcomes1, 'mismatch', 'rpc_mismatch');
  }
  if (verdict1 === 'rejected') {
    return finish(db, job, round1, outcomes1, 'absent', 'not_ft');
  }
  if (verdict1 === 'inconclusive') {
    return inconclusive(db, job, round1, outcomes1);
  }

  const exclude = new Set(round1.map((sample) => sample.account));
  const round2 = await drawSamples(
    db,
    job.contract,
    maxHeight,
    config.verifySamples,
    exclude,
  );

  if (round2.length < 2) return inconclusive(db, job, round1, outcomes1);

  const outcomes2 = await probeAll(rpc, job.contract, round2);
  const samples = round1.concat(round2);
  const outcomes = outcomes1.concat(outcomes2);

  if (outcomes2.includes('mismatch')) {
    return finish(db, job, samples, outcomes, 'mismatch', 'rpc_mismatch');
  }

  return finish(db, job, samples, outcomes, 'verified');
};

export const checkAuditorReady = async (rpc: RPC): Promise<void> => {
  const head = await headHeight(rpc);

  await checkArchival(
    rpc,
    ARCHIVAL_PROBE_ACCOUNT,
    Math.max(1, head - ARCHIVAL_PROBE_DEPTH),
  );

  logger.info('ft state audit: archival rpc confirmed');
};

export const syncAudit = async (db: Knex, rpc: RPC): Promise<void> => {
  syncRoster(db).catch((error) => {
    logger.error(error, 'ft state audit: roster sync crashed');
    sentry.captureException(error);
  });

  for (;;) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await tick(db, rpc);
    } catch (error) {
      logger.error(error, 'ft state audit: tick failed');
      sentry.captureException(error);
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(config.verifyIntervalMs);
  }
};
