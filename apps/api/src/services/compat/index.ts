import { NextFunction, Request, Response } from 'express';
import * as v from 'valibot';

import assetsReq from 'nb-schemas/dist/accounts/assets/request.js';
import assetsRes from 'nb-schemas/dist/accounts/assets/response.js';
import ftsReq from 'nb-schemas/dist/accounts/fts/request.js';
import ftsRes from 'nb-schemas/dist/accounts/fts/response.js';
import receiptsReq from 'nb-schemas/dist/accounts/receipts/request.js';
import receiptsRes from 'nb-schemas/dist/accounts/receipts/response.js';
import accountReq from 'nb-schemas/dist/accounts/request.js';
import accountRes from 'nb-schemas/dist/accounts/response.js';
import accountTxnsReq from 'nb-schemas/dist/accounts/txns/request.js';
import accountTxnsRes from 'nb-schemas/dist/accounts/txns/response.js';
import blocksReq from 'nb-schemas/dist/blocks/request.js';
import blocksRes from 'nb-schemas/dist/blocks/response.js';
import statsRes from 'nb-schemas/dist/stats/response.js';
import txnsReq from 'nb-schemas/dist/txns/request.js';
import txnsRes from 'nb-schemas/dist/txns/response.js';

import { CursorError } from '#libs/errors';
import type { RequestValidator } from '#middlewares/validate';
import * as adapt from '#services/compat/adapters';
import { ftsData, nftsData } from '#services/v3/accounts/assets';
import { txnsData as ftTxnsData } from '#services/v3/accounts/fts';
import { accountData, balanceData } from '#services/v3/accounts/index';
import { receiptsData } from '#services/v3/accounts/receipts';
import { txnsData as accountTxnsData } from '#services/v3/accounts/txns';
import { latestData } from '#services/v3/blocks/index';
import { statsData } from '#services/v3/stats/index';
import { detailData } from '#services/v3/txns/index';

type Schema = v.GenericSchema;

export class CompatError extends Error {}

/** Validates input with v3's request schema, runs v3, parses v3's response. */
const v3 = async <I extends Schema, O extends Schema>(
  request: I,
  input: Record<string, unknown>,
  fn: (req: RequestValidator<v.InferOutput<I>>) => Promise<unknown>,
  response: O,
): Promise<v.InferOutput<O>> => {
  const parsed = v.safeParse(request, input);
  if (!parsed.success) {
    const issue = parsed.issues[0];
    throw new CompatError(
      `${v.getDotPath(issue) ?? 'query'}: ${issue.message}`,
    );
  }
  const req = { validator: parsed.output } as RequestValidator<
    v.InferOutput<I>
  >;
  return v.parse(response, await fn(req));
};

const handle =
  (fn: (req: Request) => Promise<object>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await fn(req));
    } catch (error) {
      if (error instanceof CompatError || error instanceof CursorError) {
        res
          .status(422)
          .json({ data: null, errors: [{ message: error.message }] });
        return;
      }
      next(error);
    }
  };

const str = (value: unknown) =>
  value === undefined || value === '' ? undefined : String(value);

const page = (req: Request) => ({
  account: req.params.account,
  limit: Number(req.query.per_page ?? 25),
  next: str(req.query.cursor),
});

const noAction = (req: Request) => {
  if (req.query.action !== undefined)
    throw new CompatError('action: filter is not supported; use method.');
};

const account = handle(async (req) => {
  const input = { account: req.params.account };
  const [acct, balance, blocks] = await Promise.all([
    v3(accountReq.account, input, accountData, accountRes.account),
    v3(accountReq.balance, input, balanceData, accountRes.balance),
    v3(blocksReq.latest, { limit: 1 }, latestData, blocksRes.blocks),
  ]);
  if (!acct.data) return { account: [] };
  return {
    account: [adapt.account(acct.data, balance.data, blocks.data?.[0])],
  };
});

const receiptRows = async (req: Request) => {
  noAction(req);
  return v3(
    receiptsReq.receipts,
    {
      ...page(req),
      method: str(req.query.method),
      predecessor: str(req.query.from),
      receiver: str(req.query.to),
    },
    receiptsData,
    receiptsRes.receipts,
  );
};

const txns = handle(async (req) => {
  const { data, meta } = await receiptRows(req);
  const rows = (data ?? []).map((r) => ({
    ...adapt.receipt(r),
    receipt_kind: 'ACTION',
  }));
  return { cursor: meta?.next_page, txns: rows };
});

const receipts = handle(async (req) => {
  const { data, meta } = await receiptRows(req);
  return { cursor: meta?.next_page, txns: (data ?? []).map(adapt.receipt) };
});

const txnsOnly = handle(async (req) => {
  const { data, meta } = await v3(
    accountTxnsReq.txns,
    {
      ...page(req),
      receiver: str(req.query.to),
      signer: str(req.query.from),
    },
    accountTxnsData,
    accountTxnsRes.txns,
  );
  return { cursor: meta?.next_page, txns: (data ?? []).map(adapt.txnOnly) };
});

const ftTxns = handle(async (req) => {
  const { data, meta } = await v3(
    ftsReq.txns,
    {
      ...page(req),
      cause: str(req.query.event),
      contract: str(req.query.contract),
      involved: str(req.query.involved),
    },
    ftTxnsData,
    ftsRes.txns,
  );
  return { cursor: meta?.next_page, txns: (data ?? []).map(adapt.ftTxn) };
});

// v1 returned every holding; v3 pages, so this is the first page of each.
const inventory = handle(async (req) => {
  const input = { account: req.params.account };
  const [fts, nfts] = await Promise.all([
    v3(assetsReq.fts, { ...input, limit: 250 }, ftsData, assetsRes.fts),
    v3(assetsReq.nfts, { ...input, limit: 24 }, nftsData, assetsRes.nfts),
  ]);
  return { inventory: adapt.inventory(fts.data ?? [], nfts.data ?? []) };
});

const detail = (req: Request) =>
  v3(txnsReq.detail, { hash: req.params.hash }, detailData, txnsRes.detail);

const txnV1 = handle(async (req) => {
  const { data } = await detail(req);
  return { txns: data ? [adapt.txnV1(data)] : [] };
});

const txnV2 = handle(async (req) => {
  const { data } = await detail(req);
  return { txns: data ? [adapt.txnV2(data)] : [] };
});

const blocksLatest = handle(async (req) => {
  const { data } = await v3(
    blocksReq.latest,
    { limit: Number(req.query.limit ?? 10) },
    latestData,
    blocksRes.blocks,
  );
  return { blocks: (data ?? []).map(adapt.block) };
});

const stats = handle(async () => {
  const { data } = v.parse(statsRes.stats, await statsData());
  return { stats: data ? [adapt.stats(data)] : [] };
});

export default {
  account,
  blocksLatest,
  ftTxns,
  inventory,
  receipts,
  stats,
  txns,
  txnsOnly,
  txnV1,
  txnV2,
};
