import { unionWith } from 'es-toolkit';

import type {
  FTContract,
  FTContractHolderCount,
  FTContractHolderCountReq,
  FTContractHolders,
  FTContractHoldersReq,
  FTContractReq,
  FTContractTxn,
  FTContractTxnCount,
  FTContractTxnCountReq,
  FTContractTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/fts/request.js';
import response from 'nb-schemas/dist/fts/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
import {
  paginateData,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
  windowStart,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/fts';

const contract = responseHandler(
  response.contract,
  async (req: RequestValidator<FTContractReq>) => {
    const contract = req.validator.contract;

    const data = await dbEvents.oneOrNone<FTContract>(sql.contract, {
      contract,
    });

    return { data };
  },
);

const txns = responseHandler(
  response.contractTxns,
  async (req: RequestValidator<FTContractTxnsReq>) => {
    const contract = req.validator.contract;
    const affected = req.validator.affected;
    const before = req.validator.before_ts;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.txnsCursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.txnsCursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const eventsQuery: WindowListQuery<
      Omit<FTContractTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<
        Omit<FTContractTxn, 'block' | 'transaction_hash'>
      >(sql.contractTxns, {
        affected,
        before,
        contract,
        cursor: {
          index: cursor?.index,
          shard: cursor?.shard,
          timestamp: cursor?.timestamp,
          type: cursor?.type,
        },
        direction,
        end,
        limit,
        start,
      });
    };

    const events = await rollingWindowList(eventsQuery, {
      direction,
      end: windowEnd(cursor?.timestamp, before, direction),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: windowStart(config.eventsStart, cursor?.timestamp, direction),
    });

    if (!events.length) {
      return { data: [] };
    }

    const queries = events.map((event) => {
      return pgp.as.format(sql.contractTxn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<FTContractTxn>(unionQuery);

    // If lengths don't match, receipts are missing (maybe delayed).
    if (txns.length !== events.length) {
      const merged = unionWith(
        txns,
        events,
        (a, b) =>
          `${a.block_timestamp}${a.shard_id}${a.event_type}${a.event_index}` ===
          `${b.block_timestamp}${b.shard_id}${b.event_type}${b.event_index}`,
      );

      return paginateData(
        merged,
        limit,
        direction,
        (txn) => ({
          index: txn.event_index,
          shard: txn.shard_id,
          timestamp: txn.block_timestamp,
          type: txn.event_type,
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
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
        type: txn.event_type,
      }),
      !!cursor,
    );
  },
);

const txnCount = responseHandler(
  response.contractTxnCount,
  async (req: RequestValidator<FTContractTxnCountReq>) => {
    const contract = req.validator.contract;
    const affected = req.validator.affected;
    const before = req.validator.before_ts;

    const txns = await dbEvents.one<FTContractTxnCount>(sql.contractTxnCount, {
      affected,
      before,
      contract,
    });

    return { data: txns };
  },
);

const holders = responseHandler(
  response.contractHolders,
  async (req: RequestValidator<FTContractHoldersReq>) => {
    const contract = req.validator.contract;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.contractHoldersCursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.contractHoldersCursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const data = await dbEvents.manyOrNone<FTContractHolders>(sql.holders, {
      contract,
      cursor: {
        account: cursor?.account,
        amount: cursor?.amount,
      },
      direction,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
    });

    return paginateData(
      data,
      limit,
      direction,
      (holder) => ({
        account: holder.account,
        amount: holder.amount,
      }),
      !!cursor,
    );
  },
);

const holderCount = responseHandler(
  response.contractHolderCount,
  async (req: RequestValidator<FTContractHolderCountReq>) => {
    const contract = req.validator.contract;

    const data = await dbEvents.one<FTContractHolderCount>(sql.holderCount, {
      contract,
    });

    return { data };
  },
);

export default { contract, holderCount, holders, txnCount, txns };
