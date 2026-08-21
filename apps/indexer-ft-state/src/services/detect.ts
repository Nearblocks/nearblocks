import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import { Shard } from 'nb-neardata';
import { NEP } from 'nb-types';
import { decodeU128LE } from 'nb-utils';

import {
  isActionReceipt,
  isExecutionSuccess,
  isFunctionCallAction,
} from '#libs/guards';
import { staticLayouts } from '#libs/layouts';
import {
  Candidate,
  EventLog,
  Evidence,
  FTEventData,
  Layout,
  StorageWrite,
  UntrackedReason,
} from '#types/types';

const EVENT_PREFIX = 'EVENT_JSON:';
const FT_METHODS = ['ft_transfer', 'ft_transfer_call'];
const ACCOUNT_ID = /^[a-z0-9._-]{2,64}$/;
const MIN_MATCHES = 2;
const MIN_ATTEMPTS = 3;
const MAX_ATTEMPTS = 10_000;

const detected = new Map<string, Layout>();
const attempts = new Map<string, number>();
const untracked = new Set<string>();

export const getLayout = (contract: string): Layout | undefined =>
  staticLayouts[contract] ?? detected.get(contract);

export const forgetLayout = (contract: string): void => {
  detected.delete(contract);
  attempts.delete(contract);
};

const parseEvents = (logs: string[]): EventLog[] => {
  const events: EventLog[] = [];

  for (const log of logs) {
    const trimmed = log.trim();
    if (!trimmed.startsWith(EVENT_PREFIX)) continue;

    try {
      events.push(JSON.parse(trimmed.slice(EVENT_PREFIX.length)));
    } catch {
      continue;
    }
  }

  return events;
};

const evidenceFor = (
  evidences: Map<string, Evidence>,
  contract: string,
): Evidence => {
  let evidence = evidences.get(contract);

  if (!evidence) {
    evidence = { accounts: new Set(), mints: new Map() };
    evidences.set(contract, evidence);
  }

  return evidence;
};

const addAccount = (evidence: Evidence, account: unknown): void => {
  if (typeof account === 'string' && ACCOUNT_ID.test(account)) {
    evidence.accounts.add(account);
  }
};

const addEventLog = (evidence: Evidence, event: EventLog): void => {
  const entries = Array.isArray(event.data) ? event.data : [];

  for (const entry of entries) {
    const data = entry as FTEventData;

    addAccount(evidence, data.new_owner_id);
    addAccount(evidence, data.old_owner_id);
    addAccount(evidence, data.owner_id);

    if (event.event === 'ft_mint' && data.owner_id && data.amount) {
      try {
        evidence.mints.set(data.owner_id, BigInt(data.amount));
      } catch {
        continue;
      }
    }
  }
};

const addMethodCall = (
  evidence: Evidence,
  predecessorId: string,
  args: string,
): void => {
  addAccount(evidence, predecessorId);

  try {
    const parsed = JSON.parse(Buffer.from(args, 'base64').toString('utf8'));

    addAccount(evidence, (parsed as { receiver_id?: unknown }).receiver_id);
  } catch {
    return;
  }
};

export const collectEvidence = (shard: Shard): Map<string, Evidence> => {
  const evidences = new Map<string, Evidence>();

  for (const outcome of shard.receiptExecutionOutcomes) {
    if (!isExecutionSuccess(outcome.executionOutcome.outcome.status)) continue;

    const contract = outcome.executionOutcome.outcome.executorId;

    for (const event of parseEvents(outcome.executionOutcome.outcome.logs)) {
      if (event.standard !== NEP.Nep141) continue;

      addEventLog(evidenceFor(evidences, contract), event);
    }

    const receipt = outcome.receipt;
    if (!receipt || !isActionReceipt(receipt.receipt)) continue;

    for (const action of receipt.receipt.Action.actions) {
      if (!isFunctionCallAction(action)) continue;
      if (!FT_METHODS.includes(action.FunctionCall.methodName)) continue;

      addMethodCall(
        evidenceFor(evidences, receipt.receiverId),
        receipt.predecessorId,
        action.FunctionCall.args,
      );
    }
  }

  return evidences;
};

const splits = (key: Buffer): { account: string; prefix: Buffer }[] => {
  const found: { account: string; prefix: Buffer }[] = [];

  for (let length = 1; length + 4 < key.length; length++) {
    const declared = key.readUInt32LE(length);
    if (declared !== key.length - length - 4) continue;

    const account = key.subarray(length + 4).toString('utf8');
    if (!ACCOUNT_ID.test(account)) continue;

    found.push({ account, prefix: key.subarray(0, length) });
  }

  return found;
};

const candidatesFor = (writes: StorageWrite[]): Map<string, Candidate> => {
  const candidates = new Map<string, Candidate>();

  for (const write of writes) {
    if (!write.value) continue;

    for (const split of splits(write.key)) {
      const hex = split.prefix.toString('hex');
      let candidate = candidates.get(hex);

      if (!candidate) {
        candidate = {
          mixedLength: false,
          prefix: split.prefix,
          values: new Map(),
        };
        candidates.set(hex, candidate);
      }

      if (write.value.length === 16) {
        candidate.values.set(split.account, write.value);
        continue;
      }

      candidate.mixedLength = true;
    }
  }

  return candidates;
};

const reasonFor = (
  writes: StorageWrite[],
  candidates: Map<string, Candidate>,
): UntrackedReason => {
  if (!candidates.size) {
    return writes.some((write) => write.value?.length === 16)
      ? 'no_account_keys'
      : 'unsupported_layout';
  }

  return [...candidates.values()].every((candidate) => candidate.mixedLength)
    ? 'unsupported_layout'
    : 'ambiguous_prefix';
};

const markUntracked = async (
  db: Knex,
  contract: string,
  reason: UntrackedReason,
  blockHeight: number,
): Promise<void> => {
  if (untracked.has(contract)) return;

  untracked.add(contract);

  await db('ft_state_untracked')
    .insert({ block_height: blockHeight, contract, reason })
    .onConflict('contract')
    .ignore();

  logger.warn(`${contract}: untracked, ${reason}`);
};

export const detectLayout = async (
  db: Knex,
  contract: string,
  writes: StorageWrite[],
  evidence: Evidence,
  blockHeight: number,
): Promise<Layout | undefined> => {
  const candidates = candidatesFor(writes);
  const usable = [...candidates.values()].filter(
    (candidate) => !candidate.mixedLength,
  );
  const minMatches = usable.length === 1 ? 1 : MIN_MATCHES;

  let best: Candidate | undefined;
  let bestScore = 0;
  let bestMints = 0;
  let tied = false;

  for (const candidate of usable) {
    let score = 0;
    let mints = 0;

    for (const [account, value] of candidate.values) {
      if (!evidence.accounts.has(account)) continue;

      score++;

      const minted = evidence.mints.get(account);

      if (minted !== undefined && decodeU128LE(value) === minted) mints++;
    }

    if (score < minMatches) continue;

    if (score > bestScore || (score === bestScore && mints > bestMints)) {
      best = candidate;
      bestScore = score;
      bestMints = mints;
      tied = false;
      continue;
    }

    if (score === bestScore && mints === bestMints) tied = true;
  }

  if (best && !tied) {
    const layout: Layout = {
      accountOffset: null,
      accountPath: null,
      keyEncoding: 'borsh',
      keyPrefix: Buffer.from(best.prefix),
      valueEncoding: 'u128le',
      valueOffset: null,
      valuePath: null,
    };

    detected.set(contract, layout);
    attempts.delete(contract);

    return layout;
  }

  if (attempts.size >= MAX_ATTEMPTS) attempts.clear();

  const seen = (attempts.get(contract) ?? 0) + 1;

  attempts.set(contract, seen);

  if (seen >= MIN_ATTEMPTS) {
    await markUntracked(
      db,
      contract,
      reasonFor(writes, candidates),
      blockHeight,
    );
  }

  return undefined;
};
