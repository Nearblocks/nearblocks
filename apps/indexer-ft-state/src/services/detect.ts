import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import { Shard } from 'nb-neardata';
import { NEP } from 'nb-types';

import {
  isActionReceipt,
  isExecutionSuccess,
  isFunctionCallAction,
} from '#libs/guards';
import { staticLayouts } from '#libs/layouts';
import { resetVerification } from '#services/roster';
import {
  EventLog,
  Evidence,
  FTEventData,
  Layout,
  UntrackedReason,
} from '#types/types';

const EVENT_PREFIX = 'EVENT_JSON:';
const FT_METHODS = ['ft_transfer', 'ft_transfer_call'];
const ACCOUNT_ID = /^[a-z0-9._-]{2,64}$/;

const untracked = new Set<string>();

export const getLayout = (contract: string): Layout | undefined =>
  staticLayouts[contract];

export const loadUntracked = async (db: Knex): Promise<void> => {
  const blocked = await db('ft_state_untracked').pluck('contract');

  for (const contract of blocked) untracked.add(contract);

  logger.info(`loaded ${untracked.size} untracked contracts`);
};

export const isUntracked = (contract: string): boolean =>
  untracked.has(contract);

export const markUntracked = async (
  db: Knex,
  contract: string,
  blockHeight: number,
  reason: UntrackedReason = 'event_contradiction',
): Promise<void> => {
  if (untracked.has(contract)) return;

  untracked.add(contract);

  await db('ft_state_untracked')
    .insert({ block_height: blockHeight, contract, reason })
    .onConflict('contract')
    .ignore();

  logger.warn(`${contract}: untracked, ${reason}`);
};

export const clearUntracked = async (
  db: Knex,
  contract: string,
): Promise<void> => {
  if (!untracked.has(contract)) return;

  untracked.delete(contract);

  await Promise.all([
    db('ft_state_untracked').where('contract', contract).del(),
    resetVerification(db, contract),
  ]);
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
