// One-off: relabel UniversalStateInit rows in contract_code_events from UPDATE
// to INIT. Init receipts come from the base DB; rows are matched by receipt id
// and code reference. Idempotent (only touches UPDATE rows); DRY_RUN=1 counts.
import { ConnectionOptions } from 'tls';

import { bool, cleanEnv, str } from 'envalid';

import { createKnex, Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import { ActionKind, ContractEventType, Network } from 'nb-types';

type Init = {
  globalAccountId: null | string;
  globalCodeHash: null | string;
  receiptId: string;
};

const defaultFrom = {
  [Network.MAINNET]: '2026-11-05',
  [Network.TESTNET]: '2026-10-20',
};

const env = cleanEnv(process.env, {
  CONTRACT_DATABASE_URL: str(),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  DRY_RUN: bool({ default: false }),
  NETWORK: str({ choices: [Network.MAINNET, Network.TESTNET] }),
  RELABEL_FROM: str({ default: '' }),
});

const HOUR_NS = 3_600_000_000_000n;
const DAY_NS = 24n * HOUR_NS;
const BATCH = 500;

const toNs = (day: string) => {
  const ms = Date.parse(`${day}T00:00:00Z`);

  if (Number.isNaN(ms)) throw new Error(`invalid day: ${day}`);

  return BigInt(ms) * 1_000_000n;
};

const ssl: ConnectionOptions = { rejectUnauthorized: true };

if (env.DATABASE_CA) {
  ssl.ca = Buffer.from(env.DATABASE_CA, 'base64').toString('utf-8');
  ssl.cert = Buffer.from(env.DATABASE_CERT, 'base64').toString('utf-8');
  ssl.key = Buffer.from(env.DATABASE_KEY, 'base64').toString('utf-8');
}

const connect = (name: string, connectionString: string): Knex =>
  createKnex({
    client: 'pg',
    connection: {
      application_name: name,
      connectionString,
      ssl: ssl.ca ? ssl : false,
      statement_timeout: 120_000,
    },
    pool: { max: 2, min: 0 },
  });

const dbBase = connect('relabel-inits-base', env.DATABASE_URL);
const dbContract = connect('relabel-inits-contract', env.CONTRACT_DATABASE_URL);

const parseArgs = (args: unknown): null | Record<string, unknown> => {
  if (typeof args === 'string') {
    try {
      return JSON.parse(args) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  return args && typeof args === 'object'
    ? (args as Record<string, unknown>)
    : null;
};

const toInit = (receiptId: string, rawArgs: unknown): Init | null => {
  const code = parseArgs(rawArgs)?.code as
    | { account_id?: string; hash?: string }
    | null
    | undefined;

  if (!code) return null;

  return {
    globalAccountId: code.account_id ?? null,
    globalCodeHash: code.hash ?? null,
    receiptId,
  };
};

const findInits = async (start: bigint, end: bigint) => {
  const rows = await dbBase('action_receipt_actions')
    .where('action_kind', ActionKind.UNIVERSAL_STATE_INIT)
    .where('receipt_included_in_block_timestamp', '>=', start.toString())
    .where('receipt_included_in_block_timestamp', '<', end.toString())
    .select('receipt_id', 'args');

  return rows.map((row) => ({ init: toInit(row.receipt_id, row.args), row }));
};

// Execution can trail inclusion, so the contract-side window gets a day's slack.
const relabel = async (inits: Init[], start: bigint, end: bigint) => {
  const values = inits.map(() => '(?, ?::TEXT, ?::TEXT)').join(', ');
  const bindings = inits.flatMap((init) => [
    init.receiptId,
    init.globalAccountId,
    init.globalCodeHash,
  ]);
  const source = `(VALUES ${values}) v (receipt_id, global_account_id, global_code_hash)`;
  const where = `
    WHERE c.receipt_id = v.receipt_id
      AND c.event_type = ?
      AND c.code_hash IS NULL
      AND c.global_account_id IS NOT DISTINCT FROM v.global_account_id
      AND c.global_code_hash IS NOT DISTINCT FROM v.global_code_hash
      AND c.block_timestamp >= ?
      AND c.block_timestamp < ?`;
  const params = [
    ...bindings,
    ContractEventType.UPDATE,
    start.toString(),
    (end + DAY_NS).toString(),
  ];

  if (env.DRY_RUN) {
    const { rows } = await dbContract.raw<{ rows: { count: string }[] }>(
      `SELECT COUNT(*) AS count FROM contract_code_events c, ${source} ${where}`,
      params,
    );

    return Number(rows[0]?.count ?? 0);
  }

  const result = await dbContract.raw<{ rowCount: number }>(
    `UPDATE contract_code_events c SET event_type = ? FROM ${source} ${where}`,
    [ContractEventType.INIT, ...params],
  );

  return result.rowCount;
};

const run = async () => {
  const from = toNs(env.RELABEL_FROM || defaultFrom[env.NETWORK]);
  const now = BigInt(Date.now()) * 1_000_000n;
  const totals = { found: 0, noCode: 0, relabelled: 0 };

  logger.info({ dryRun: env.DRY_RUN, from: from.toString() }, 'relabel start');

  for (let start = from; start < now; start += HOUR_NS) {
    const end = start + HOUR_NS;
    const found = await findInits(start, end);
    const inits = found.flatMap(({ init }) => (init ? [init] : []));

    totals.found += found.length;
    totals.noCode += found.length - inits.length;

    for (let i = 0; i < inits.length; i += BATCH) {
      const count = await relabel(inits.slice(i, i + BATCH), start, end);

      totals.relabelled += count;
      logger.info(
        { count, inits: inits.length, start: start.toString() },
        'batch',
      );
    }
  }

  logger.info({ ...totals, dryRun: env.DRY_RUN }, 'relabel completed');
};

run()
  .then(() => 0)
  .catch((error) => {
    logger.error(error);

    return 1;
  })
  .then(async (code) => {
    await Promise.all([dbBase.destroy(), dbContract.destroy()]);
    process.exit(code);
  });
