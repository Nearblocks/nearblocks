/* eslint-disable no-await-in-loop, no-constant-condition */
import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import config from '#config';
import { ReconciliationError } from '#libs/errors';
import { db } from '#libs/knex';
import { findMetadataPda, parseSymbol } from '#libs/metaplex';
import { tvlDayHeight } from '#libs/prom';
import {
  getAccountInfo,
  getMintMetadataSymbol,
  getSignaturesForAddress,
  getTokenAccountsByOwner,
  getTransaction,
} from '#libs/solana';
import { DAY_MS, retry, todayUtc } from '#libs/utils';
import { SolanaAccount, SolanaDayTx, Source } from '#types/types';

const PAGE_LIMIT = 1000;
const MAX_SCAN_PAGES_PER_PASS = 30;
const MAX_RESOLUTIONS_PER_PASS = 500;
const MAX_SYMBOL_BACKFILL_PER_PASS = 20;

type DayTxRow = Pick<
  SolanaDayTx,
  'amount' | 'ata' | 'chain' | 'date' | 'protocol' | 'resolved' | 'signature'
>;

const fetchSymbol = async (mint: string): Promise<string> => {
  const pda = findMetadataPda(mint);
  const data = await retry(() => getAccountInfo(config.solanaUrl, pda), {
    label: `metadata ${mint}`,
  });
  const symbol = data ? parseSymbol(data) : null;

  if (symbol) return symbol;

  const extSymbol = await retry(
    () => getMintMetadataSymbol(config.solanaUrl, mint),
    { label: `mint metadata ${mint}` },
  );

  return extSymbol ?? '';
};

const backfillSymbols = async (source: Source) => {
  const stale = await db('tvl_tokens')
    .where({ chain: source.chain, protocol: source.protocol })
    .whereNull('symbol')
    .limit(MAX_SYMBOL_BACKFILL_PER_PASS)
    .select('token');

  for (const { token } of stale) {
    const symbol = await fetchSymbol(token);

    await db('tvl_tokens')
      .where({ chain: source.chain, protocol: source.protocol, token })
      .update({ symbol });
  }
};

const discoverAccounts = async (
  source: Source,
  authority: string,
): Promise<SolanaAccount[]> => {
  const tokenAccounts = await retry(
    () => getTokenAccountsByOwner(config.solanaUrl, authority),
    { label: 'token accounts' },
  );

  const accountRows = tokenAccounts.map((t) => ({
    ata: t.pubkey,
    chain: source.chain,
    decimals: t.decimals,
    mint: t.mint,
    protocol: source.protocol,
  }));

  if (accountRows.length) {
    await db('tvl_solana_accounts')
      .insert(accountRows)
      .onConflict(['protocol', 'chain', 'ata'])
      .ignore();
  }

  await backfillSymbols(source);

  const known = await db('tvl_tokens')
    .whereIn(
      'token',
      tokenAccounts.map((t) => t.mint),
    )
    .andWhere({ chain: source.chain, protocol: source.protocol })
    .pluck('token');
  const knownSet = new Set(known);
  const fresh = tokenAccounts.filter((t) => !knownSet.has(t.mint));

  for (const t of fresh) {
    const symbol = await fetchSymbol(t.mint);

    await db('tvl_tokens')
      .insert({
        chain: source.chain,
        coingecko_id: null,
        decimals: t.decimals,
        first_seen_date: null,
        protocol: source.protocol,
        symbol,
        token: t.mint,
      })
      .onConflict(['protocol', 'chain', 'token'])
      .ignore();
  }

  return db('tvl_solana_accounts')
    .where({ chain: source.chain, protocol: source.protocol })
    .select('*');
};

const scanAccount = async (source: Source, account: SolanaAccount) => {
  const today = todayUtc();
  const backward = !account.scan_complete;

  let before = backward ? account.scan_before ?? undefined : undefined;
  const until = backward ? undefined : account.newest_signature ?? undefined;

  let pages = 0;
  let newestSeen: string | undefined;
  let todayRow: DayTxRow | undefined;
  let reachedEnd = false;

  while (pages < MAX_SCAN_PAGES_PER_PASS) {
    const entries = await retry(
      () =>
        getSignaturesForAddress(config.solanaUrl, account.ata, {
          before,
          limit: PAGE_LIMIT,
          until,
        }),
      { label: `sigs ${account.ata.slice(0, 8)}` },
    );

    logger.info(
      `${source.protocol}/${source.chain}: ${
        backward ? 'scanning' : 'syncing'
      } account: ${account.ata}, from: ${
        before ?? until ?? 'tip'
      }, signatures: ${entries.length}`,
    );

    if (!entries.length) {
      reachedEnd = true;
      break;
    }

    newestSeen ??= entries[0].signature;

    const closedRows: DayTxRow[] = [];

    for (const entry of entries) {
      if (entry.err || entry.blockTime === null) continue;

      const day = ((BigInt(entry.blockTime) * 1000n) / DAY_MS) * DAY_MS;
      const row: DayTxRow = {
        amount: null,
        ata: account.ata,
        chain: source.chain,
        date: day.toString(),
        protocol: source.protocol,
        resolved: false,
        signature: entry.signature,
      };

      if (day === today) {
        todayRow ??= row;
      } else {
        closedRows.push(row);
      }
    }

    if (closedRows.length) {
      await db('tvl_solana_day_tx')
        .insert(closedRows)
        .onConflict(['protocol', 'chain', 'ata', 'date'])
        .ignore();
    }

    pages++;

    if (entries.length < PAGE_LIMIT) {
      reachedEnd = true;
      break;
    }

    before = entries[entries.length - 1].signature;

    if (pages < MAX_SCAN_PAGES_PER_PASS) await sleep(config.solanaPageDelayMs);
  }

  if (todayRow) {
    await db('tvl_solana_day_tx')
      .insert(todayRow)
      .onConflict(['protocol', 'chain', 'ata', 'date'])
      .merge({ amount: null, resolved: false, signature: todayRow.signature });
  }

  const update: Partial<SolanaAccount> = {};

  if (backward) {
    update.scan_before = before ?? null;
    if (reachedEnd) update.scan_complete = true;
  } else if (newestSeen) {
    update.newest_signature = newestSeen;
  }

  if (Object.keys(update).length) {
    await db('tvl_solana_accounts')
      .where({
        ata: account.ata,
        chain: source.chain,
        protocol: source.protocol,
      })
      .update(update);
  }
};

const resolveDayTx = async (
  source: Source,
  accounts: Map<string, SolanaAccount>,
  authority: string,
) => {
  const pending = await db<SolanaDayTx>('tvl_solana_day_tx')
    .where({ chain: source.chain, protocol: source.protocol, resolved: false })
    .orderBy('date', 'asc')
    .limit(MAX_RESOLUTIONS_PER_PASS)
    .select('*');

  if (!pending.length) return;

  const resolved: { amount: null | string; ata: string; date: string }[] = [];
  let matched = 0;

  for (let i = 0; i < pending.length; i++) {
    const row = pending[i];
    const account = accounts.get(row.ata);

    if (!account) continue;

    const tx = await retry(
      () => getTransaction(config.solanaUrl, row.signature),
      {
        label: `tx ${row.signature}`,
      },
    );

    if (!tx?.meta) {
      logger.info(
        `${source.protocol}/${source.chain}: tx ${row.signature} missing meta, retrying next pass`,
      );

      continue;
    }

    const keys = [
      ...tx.transaction.message.accountKeys,
      ...(tx.meta.loadedAddresses?.writable ?? []),
      ...(tx.meta.loadedAddresses?.readonly ?? []),
    ];
    const idx = keys.indexOf(account.ata);

    const balance = tx.meta.postTokenBalances?.find(
      (b) => b.accountIndex === idx,
    );

    if (balance) {
      if (balance.owner && balance.owner !== authority) {
        throw new ReconciliationError(
          `${source.protocol}/${source.chain}: postTokenBalances owner ${balance.owner} != configured authority ${authority} for ${account.ata}`,
        );
      }

      resolved.push({
        amount: BigInt(balance.uiTokenAmount.amount).toString(),
        ata: row.ata,
        date: row.date,
      });
      matched++;
    } else {
      resolved.push({ amount: null, ata: row.ata, date: row.date });
    }

    if (i < pending.length - 1) await sleep(config.solanaTxDelayMs);
  }

  await db.transaction(async (trx) => {
    for (const r of resolved) {
      await trx('tvl_solana_day_tx')
        .where({
          ata: r.ata,
          chain: source.chain,
          date: r.date,
          protocol: source.protocol,
        })
        .update({ amount: r.amount, resolved: true });
    }
  });

  logger.info(
    `${source.protocol}/${source.chain}: resolved ${resolved.length}/${pending.length} readings (${matched} with a balance)`,
  );
};

const foldBalances = async (source: Source) => {
  const yesterday = todayUtc() - DAY_MS; // today isn't final yet

  const result = await db.raw(
    `
      WITH accounts AS (
        SELECT ata, mint FROM tvl_solana_accounts WHERE protocol = ? AND chain = ?
      ),
      bounds AS (
        SELECT MIN(date) AS min_date
        FROM tvl_solana_day_tx
        WHERE protocol = ? AND chain = ? AND amount IS NOT NULL
      ),
      days AS (
        SELECT generate_series(b.min_date, ?::BIGINT, 86400000) AS date
        FROM bounds b
        WHERE b.min_date IS NOT NULL
      ),
      readings AS (
        SELECT ata, date, amount
        FROM tvl_solana_day_tx
        WHERE protocol = ? AND chain = ? AND amount IS NOT NULL
      ),
      filled AS (
        SELECT
          a.ata,
          a.mint,
          d.date,
          (
            SELECT r.amount FROM readings r
            WHERE r.ata = a.ata AND r.date <= d.date
            ORDER BY r.date DESC
            LIMIT 1
          ) AS amount
        FROM accounts a
        CROSS JOIN days d
      )
      INSERT INTO
        tvl_balances_daily (date, protocol, chain, token, amount)
      SELECT
        date, ?, ?, mint, SUM(COALESCE(amount, 0))
      FROM filled
      GROUP BY date, mint
      ON CONFLICT (date, protocol, chain, token) DO UPDATE
      SET amount = EXCLUDED.amount
      RETURNING date
    `,
    [
      source.protocol,
      source.chain,
      source.protocol,
      source.chain,
      yesterday.toString(),
      source.protocol,
      source.chain,
      source.protocol,
      source.chain,
    ],
  );

  const rows: { date: string }[] = result.rows;

  if (rows.length) {
    await db('settings')
      .insert({
        key: `tvl_balances_${source.protocol}_${source.chain}`,
        value: { sync: yesterday.toString() },
      })
      .onConflict('key')
      .merge();

    tvlDayHeight.set(
      { chain: source.chain, protocol: source.protocol },
      Number(yesterday),
    );

    await db.raw(
      `
        UPDATE tvl_tokens t
        SET first_seen_date = b.min_date
        FROM (
          SELECT token, MIN(date) AS min_date
          FROM tvl_balances_daily
          WHERE protocol = ? AND chain = ?
          GROUP BY token
        ) b
        WHERE t.protocol = ? AND t.chain = ? AND t.token = b.token AND t.first_seen_date IS NULL
      `,
      [source.protocol, source.chain, source.protocol, source.chain],
    );
  }
};

const sync = async (source: Source) => {
  const authority = source.authority ?? source.address;

  const accounts = await discoverAccounts(source, authority);
  const accountMap = new Map(accounts.map((a) => [a.ata, a]));

  for (const account of accounts) {
    await scanAccount(source, account);
  }

  await resolveDayTx(source, accountMap, authority);
  await foldBalances(source);
};

export const processSource = async (source: Source) => {
  if (!config.solanaUrl) return;

  while (true) {
    logger.info(`${source.protocol}/${source.chain}: polling`);

    await sync(source);
    await sleep(config.intervalMs);
  }
};
