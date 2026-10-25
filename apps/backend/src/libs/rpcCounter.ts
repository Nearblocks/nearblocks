import { logger } from 'nb-logger';

import config from '#config';
import { endpointLabel } from '#libs/rpcClients';

type Tally = { errors: number; ok: number; retries: number };

const MINUTE_MS = 60000;

const tallies = new Map<string, Tally>();
// Which endpoint answered: shows how much the primary serves and how much
// falls through to later RPC_URLS entries.
const endpointTallies = new Map<string, Omit<Tally, 'retries'>>();

const endpoint = endpointLabel(config.rpcUrl);

let job = 'backend';
let windowStart = Date.now();

export const setRpcJob = (name: string) => {
  job = name;
};

export const recordRpcCall = (
  path: string,
  attempt: number,
  ok: boolean,
  endpointName: string,
) => {
  const tally = tallies.get(path) ?? { errors: 0, ok: 0, retries: 0 };
  const endpointTally = endpointTallies.get(endpointName) ?? {
    errors: 0,
    ok: 0,
  };

  if (ok) {
    endpointTally.ok += 1;
  } else {
    endpointTally.errors += 1;
  }
  endpointTallies.set(endpointName, endpointTally);

  if (ok) {
    tally.ok += 1;
  } else {
    tally.errors += 1;
  }

  if (attempt > 1) {
    tally.retries += 1;
  }

  tallies.set(path, tally);
};

const emit = (final: boolean) => {
  if (tallies.size) {
    const paths = [...tallies.entries()].sort(
      (a, b) => b[1].ok + b[1].errors - (a[1].ok + a[1].errors),
    );
    const total = paths.reduce(
      (acc, [, tally]) => ({
        calls: acc.calls + tally.ok + tally.errors,
        errors: acc.errors + tally.errors,
        ok: acc.ok + tally.ok,
        retries: acc.retries + tally.retries,
      }),
      { calls: 0, errors: 0, ok: 0, retries: 0 },
    );

    logger.info(
      {
        asOf: new Date().toISOString(),
        endpoint,
        endpoints: Object.fromEntries(endpointTallies),
        final,
        job,
        paths: Object.fromEntries(paths),
        total,
        type: 'rpc_calls',
        windowStart: new Date(windowStart).toISOString(),
      },
      `rpc: ${job}: ${total.calls} calls, ${total.retries} retries, ${
        total.errors
      } errors${final ? '' : ' (so far this hour)'}`,
    );
  }

  if (final) {
    tallies.clear();
    endpointTallies.clear();
    windowStart = Date.now();
  }
};

const isHourBoundary = () => new Date().getUTCMinutes() === 0;

const scheduleTick = () => {
  setTimeout(
    () => {
      emit(isHourBoundary());
      scheduleTick();
    },
    MINUTE_MS - (Date.now() % MINUTE_MS),
  ).unref();
};

scheduleTick();
