import { logger } from 'nb-logger';

import config from '#config';

type Tally = { errors: number; ok: number; retries: number };

const MINUTE_MS = 60000;

const tallies = new Map<string, Tally>();

const endpoint = (() => {
  try {
    const url = new URL(config.rpcUrl);

    return url.pathname === '/' ? url.host : `${url.host}${url.pathname}`;
  } catch {
    return 'unknown';
  }
})();

let job = 'backend';
let windowStart = Date.now();

export const setRpcJob = (name: string) => {
  job = name;
};

export const recordRpcCall = (path: string, attempt: number, ok: boolean) => {
  const tally = tallies.get(path) ?? { errors: 0, ok: 0, retries: 0 };

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
