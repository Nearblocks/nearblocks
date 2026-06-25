import { unionWith } from 'es-toolkit';

import type {
  MCMpcParameters,
  MCStats,
  MCTxn,
  MCTxnCountReq,
  MCTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/multichain/request.js';
import response from 'nb-schemas/dist/multichain/response.js';
import { Network } from 'nb-types';

import config from '#config';
import cursors from '#libs/cursors';
import { bytesParse, callFunction, getProvider } from '#libs/near';
import { dbBase, dbMultichain, pgp } from '#libs/pgp';
import redis from '#libs/redis';
import {
  countFromEstimate,
  paginateData,
  rollingWindowCount,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
  windowStart,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/multichain';

type RawRunning = {
  parameters: {
    participants: {
      participants: [string, number, { tls_public_key: string; url: string }][];
    };
    threshold: number;
  };
};

const MPC_CONTRACT: Record<string, string> = {
  [Network.MAINNET]: 'v1.signer',
  [Network.TESTNET]: 'v1.signer-prod.testnet',
};

const MPC_STATE_KEY = 'v3:multichain:mpc:state';
const MPC_STATE_TTL = 300;

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<MCTxnsReq>) => {
    const limit = req.validator.limit;
    const account = req.validator.account;
    const address = req.validator.address;
    const before = req.validator.before_ts;
    const chain = req.validator.chain;
    const txn = req.validator.txn;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const signaturesQuery: WindowListQuery<
      Omit<MCTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbMultichain.manyOrNone<Omit<MCTxn, 'block' | 'transaction_hash'>>(
        sql.signatures,
        {
          account,
          address,
          before,
          chain,
          cursor: {
            index: cursor?.index,
            timestamp: cursor?.timestamp,
          },
          direction,
          end,
          limit,
          start,
          txn,
        },
      );
    };

    const signatures = await rollingWindowList(signaturesQuery, {
      direction,
      end: windowEnd(cursor?.timestamp, before, direction),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: windowStart(config.baseStart, cursor?.timestamp, direction),
    });

    if (!signatures.length) {
      return { data: [] };
    }

    const queries = signatures.map((signature) => {
      return pgp.as.format(sql.signatureTxn, signature);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<MCTxn>(unionQuery);

    // If lengths don't match, receipts are missing (maybe delayed).
    if (txns.length !== signatures.length) {
      const merged = unionWith(
        txns,
        signatures,
        (a, b) =>
          `${a.block_timestamp}${a.event_index}` ===
          `${b.block_timestamp}${b.event_index}`,
      );

      return paginateData(
        merged,
        limit,
        direction,
        (txn) => ({
          index: txn.event_index,
          timestamp: txn.block_timestamp,
        }),
        !!cursor,
      );
    }

    return paginateData(
      txns,
      limit,
      direction,
      (txn) => ({
        index: txn.event_index,
        timestamp: txn.block_timestamp,
      }),
      !!cursor,
    );
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<MCTxnCountReq>) => {
    const account = req.validator.account;
    const address = req.validator.address;
    const before = req.validator.before_ts;
    const chain = req.validator.chain;
    const txn = req.validator.txn;

    const beforeTs = before ? BigInt(before) - 1n : undefined;

    const count = await countFromEstimate({
      db: dbMultichain,
      exactCount: () =>
        rollingWindowCount(
          (start, end, limit) =>
            dbMultichain.one<{ count: string }>(sql.signatureCount, {
              account,
              address,
              before,
              chain,
              end,
              limit,
              start,
              txn,
            }),
          {
            end: beforeTs,
            limit: config.maxQueryCount,
            start: config.baseStart,
          },
        ),
      limit: config.maxQueryCount,
      maxCost: config.maxQueryCost,
      maxRows: config.maxQueryRows,
      query: sql.signatureCountEstimate,
      values: {
        account: account ?? null,
        address: address ?? null,
        before: before ?? null,
        chain: chain ?? null,
        start: config.baseStart.toString(),
        txn: txn ?? null,
      },
    });

    return { data: { count } };
  },
);

const stats = responseHandler(response.stats, async () => {
  const data = await dbMultichain.oneOrNone<MCStats>(sql.stats);

  return { data };
});

const mpcs = responseHandler(response.mpcState, async () => {
  const cached = await redis.parse(MPC_STATE_KEY);
  if (cached) {
    return { data: cached as MCMpcParameters };
  }

  const contract = MPC_CONTRACT[config.network];
  const res = (await callFunction(
    getProvider(),
    contract,
    'state',
  )) as unknown as { result: number[] };
  const state = bytesParse(Buffer.from(res.result)) as Record<string, unknown>;

  if (!('Running' in state)) {
    const currentState = Object.keys(state)[0] ?? 'Unknown';
    return {
      data: null,
      errors: [
        { message: `MPC contract not in Running state: ${currentState}` },
      ],
    };
  }

  const { parameters } = state['Running'] as RawRunning;
  const result: MCMpcParameters = {
    participants: parameters.participants.participants.map(
      ([account, , { tls_public_key, url }]) => ({
        account,
        public_key: tls_public_key,
        url,
      }),
    ),
    threshold: parameters.threshold,
  };

  await redis.set(MPC_STATE_KEY, JSON.stringify(result), MPC_STATE_TTL);

  return { data: result };
});

export default { count, mpcs, stats, txns };
