import type { TxnFT, TxnMT, TxnReceipt } from 'nb-schemas';

// v2.ref-finance.near plain-text log: "Swapped 1234 a.near for 5678 b.near,"
export const SWAPPED_RE = /^Swapped (\d+) (\S+) for (\d+) (\S+)/;

export type SwapRow = {
  amountIn: string;
  amountOut: string;
  contractIn: string;
  contractOut: string;
};

export const parseRheaSwapLogs = (logs: unknown[]): SwapRow[] => {
  const rows: SwapRow[] = [];
  for (const log of logs) {
    if (typeof log !== 'string') continue;
    const m = SWAPPED_RE.exec(log);
    if (!m) continue;
    rows.push({
      amountIn: m[1],
      amountOut: m[3],
      contractIn: m[2].replace(/,$/, ''),
      contractOut: m[4].replace(/,$/, ''),
    });
  }
  return rows;
};

export type TokenMeta = {
  decimals: null | number;
  icon: null | string;
  name: null | string;
  symbol: null | string;
};

export const parseEventJson = (
  log: unknown,
): null | Record<string, unknown> => {
  if (typeof log !== 'string') return null;
  const prefix = 'EVENT_JSON:';
  if (!log.startsWith(prefix)) return null;
  try {
    const parsed = JSON.parse(log.slice(prefix.length));
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
};

export const buildMetaMap = (
  fts: null | TxnFT[],
  mts: null | TxnMT[],
): Map<string, TokenMeta> => {
  const map = new Map<string, TokenMeta>();
  for (const ft of fts ?? []) {
    if (!map.has(ft.contract_account_id)) {
      map.set(ft.contract_account_id, {
        decimals: ft.meta.decimals,
        icon: ft.meta.icon,
        name: ft.meta.name,
        symbol: ft.meta.symbol,
      });
    }
  }
  for (const mt of mts ?? []) {
    if (!mt.base_meta) continue;
    const mtMeta: TokenMeta = {
      decimals: mt.base_meta.decimals,
      icon: mt.base_meta.icon,
      name: mt.base_meta.name,
      symbol: mt.base_meta.symbol,
    };
    // Key by contract_account_id (general contract lookup)
    if (!map.has(mt.contract_account_id)) {
      map.set(mt.contract_account_id, mtMeta);
    }
    // Key by token_id for per-token lookups (intents diff keys match this)
    if (mt.token_id && !map.has(mt.token_id)) {
      map.set(mt.token_id, mtMeta);
    }
  }
  return map;
};

export const flattenReceipts = (receipt: TxnReceipt): TxnReceipt[] => [
  receipt,
  ...receipt.receipts.flatMap(flattenReceipts),
];

export const isRheaSwapContract = (r: string): boolean =>
  r === 'v2.ref-finance.near';

export const isIntentsContract = (r: string): boolean => r === 'intents.near';

export const isBurrowContract = (r: string): boolean =>
  r === 'contract.main.burrow.near';

// Validator staking pools: foo.poolv1.near / foo.pool.near (mainnet).
export const isStakingPool = (r: string): boolean =>
  /\.pool(v1)?\.near$/.test(r);

export const isMetaPool = (r: string): boolean => r === 'meta-pool.near';

export const isLinear = (r: string): boolean => r === 'linear-protocol.near';

export const isLiquidStakingContract = (r: string): boolean =>
  isMetaPool(r) || isLinear(r);

// Burrow emits NEP-297 style events; data carries the affected FT and account.
const BURROW_EVENTS = new Set([
  'borrow',
  'decrease_collateral',
  'deposit',
  'deposit_to_reserve',
  'increase_collateral',
  'repay',
  'withdraw_succeeded',
]);

export type BurrowEvent = {
  account_id: string;
  amount: string;
  event: string;
  token_id: string;
};

// Burrow logs may or may not carry the `EVENT_JSON:` prefix — strip it if present.
const parseLooseEventJson = (log: unknown): null | Record<string, unknown> => {
  if (typeof log !== 'string') return null;
  const prefix = 'EVENT_JSON:';
  const json = log.startsWith(prefix) ? log.slice(prefix.length) : log;
  try {
    const parsed = JSON.parse(json);
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
};

export const parseBurrowEvents = (logs: unknown[]): BurrowEvent[] => {
  const events: BurrowEvent[] = [];
  for (const log of logs) {
    const parsed = parseLooseEventJson(log);
    if (!parsed) continue;
    const event = parsed.event;
    if (typeof event !== 'string' || !BURROW_EVENTS.has(event)) continue;

    const data = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
    for (const item of data) {
      if (!item || typeof item !== 'object') continue;
      const { account_id, amount, token_id } = item as Record<string, unknown>;
      if (
        typeof account_id !== 'string' ||
        typeof amount !== 'string' ||
        typeof token_id !== 'string'
      ) {
        continue;
      }
      events.push({ account_id, amount, event, token_id });
    }
  }
  return events;
};

// intents.near dip4 `ft_withdraw` event — a token leaving Intents to a NEAR account.
export type IntentsWithdrawal = {
  account_id: string;
  amount: string;
  receiver_id: string;
  token: string;
};

export const parseIntentsWithdrawals = (
  logs: unknown[],
): IntentsWithdrawal[] => {
  const withdrawals: IntentsWithdrawal[] = [];
  for (const log of logs) {
    const event = parseEventJson(log);
    if (!event) continue;
    if (event.standard !== 'dip4' || event.event !== 'ft_withdraw') continue;

    const data = Array.isArray(event.data) ? event.data : [event.data];
    for (const item of data) {
      if (!item || typeof item !== 'object') continue;
      const { account_id, amount, receiver_id, token } = item as Record<
        string,
        unknown
      >;
      if (
        typeof account_id === 'string' &&
        typeof amount === 'string' &&
        typeof receiver_id === 'string' &&
        typeof token === 'string'
      ) {
        withdrawals.push({ account_id, amount, receiver_id, token });
      }
    }
  }
  return withdrawals;
};

// intents.near nep245 `mt_mint` with memo "deposit" — tokens credited into Intents.
export type IntentsDeposit = {
  account_id: string;
  amount: string;
  token: string;
};

export const parseIntentsDeposits = (logs: unknown[]): IntentsDeposit[] => {
  const deposits: IntentsDeposit[] = [];
  for (const log of logs) {
    const event = parseEventJson(log);
    if (!event) continue;
    if (event.standard !== 'nep245' || event.event !== 'mt_mint') continue;

    const data = Array.isArray(event.data) ? event.data : [event.data];
    for (const item of data) {
      if (!item || typeof item !== 'object') continue;
      const { amounts, memo, owner_id, token_ids } = item as Record<
        string,
        unknown
      >;
      if (memo !== 'deposit' || typeof owner_id !== 'string') continue;
      if (!Array.isArray(token_ids) || !Array.isArray(amounts)) continue;

      token_ids.forEach((token, i) => {
        const amount = amounts[i];
        if (typeof token === 'string' && typeof amount === 'string') {
          deposits.push({ account_id: owner_id, amount, token });
        }
      });
    }
  }
  return deposits;
};

export type StakingKind = 'deposit' | 'stake' | 'unstake' | 'withdraw';

export type StakingEntry = {
  account: string;
  amount: string;
  kind: StakingKind;
};

// Plain-text logs emitted by the standard staking-pool contract (yoctoNEAR amounts).
const STAKING_LOG: Record<StakingKind, RegExp> = {
  deposit: /^@(\S+) deposited (\d+)\. New unstaked balance is \d+/,
  stake: /^@(\S+) staking (\d+)\. Received \d+ new staking shares/,
  unstake: /^@(\S+) unstaking (\d+)\. Spent \d+ staking shares/,
  withdraw: /^@(\S+) withdrawing (\d+)\. New unstaked balance is \d+/,
};

export const parseStakingLogs = (logs: unknown[]): StakingEntry[] => {
  const entries: StakingEntry[] = [];
  for (const log of logs) {
    if (typeof log !== 'string') continue;
    for (const kind of Object.keys(STAKING_LOG) as StakingKind[]) {
      const m = STAKING_LOG[kind].exec(log);
      if (m) {
        entries.push({ account: m[1], amount: m[2], kind });
        break;
      }
    }
  }
  return entries;
};

/**
 * Walk flattened receipts and collect FT contract ids needed by Rhea and Burrow
 * renderers that are NOT covered by the MT meta path (intents is excluded).
 */
export const collectFtContracts = (flat: TxnReceipt[]): string[] => {
  const contracts = new Set<string>();
  for (const receipt of flat) {
    const logs = receipt.outcome?.logs;
    if (!logs || logs.length === 0) continue;
    const receiver = receipt.receiver_account_id;

    if (isRheaSwapContract(receiver)) {
      for (const row of parseRheaSwapLogs(logs)) {
        contracts.add(row.contractIn);
        contracts.add(row.contractOut);
      }
    } else if (isBurrowContract(receiver)) {
      for (const event of parseBurrowEvents(logs)) {
        contracts.add(event.token_id);
      }
    } else if (isIntentsContract(receiver)) {
      // ft_withdraw tokens are plain FT contract ids (not nep141:-prefixed MT keys).
      for (const w of parseIntentsWithdrawals(logs)) {
        contracts.add(w.token);
      }
    }
  }
  return [...contracts];
};
