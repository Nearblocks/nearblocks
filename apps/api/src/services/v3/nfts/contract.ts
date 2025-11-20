import { unionWith } from 'es-toolkit';

import type {
  NFTContract,
  NFTContractHolderCount,
  NFTContractHolderCountReq,
  NFTContractHolders,
  NFTContractHoldersReq,
  NFTContractReq,
  NFTContractTxn,
  NFTContractTxnCount,
  NFTContractTxnCountReq,
  NFTContractTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/nfts/request.js';
import response from 'nb-schemas/dist/nfts/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
import {
  paginateData,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/nfts';

const contract = responseHandler(
  response.contract,
  async (req: RequestValidator<NFTContractReq>) => {
    const contract = req.validator.contract;

    const data = await dbEvents.oneOrNone<NFTContract>(sql.contract, {
      contract,
    });

    return { data };
  },
);

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<NFTContractTxnsReq>) => {
    const contract = req.validator.contract;
    const affected = req.validator.affected;
    const before = req.validator.before_ts;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.txnCursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.txnCursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const eventsQuery: WindowListQuery<
      Omit<NFTContractTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<
        Omit<NFTContractTxn, 'block' | 'transaction_hash'>
      >(sql.contractTxns, {
        affected,
        before,
        contract,
        cursor: {
          index: cursor?.index,
          shard: cursor?.shard,
          timestamp: cursor?.timestamp,
        },
        direction,
        end,
        limit,
        start,
      });
    };

    const events = await rollingWindowList(eventsQuery, {
      end: windowEnd(cursor?.timestamp, before),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: config.eventsStart,
    });

    if (!events.length) {
      return { data: [] };
    }

    const queries = events.map((event) => {
      return pgp.as.format(sql.contractTxn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<NFTContractTxn>(unionQuery);

    // If lengths don't match, receipts are missing (maybe delayed).
    if (txns.length !== events.length) {
      const merged = unionWith(
        txns,
        events,
        (a, b) =>
          `${a.block_timestamp}${a.shard_id}${a.event_index}` ===
          `${b.block_timestamp}${b.shard_id}${b.event_index}`,
      );

      return paginateData(
        merged,
        limit,
        direction,
        (txn) => ({
          index: txn.event_index,
          shard: txn.shard_id,
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
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
      }),
      !!cursor,
    );
  },
);

const txnCount = responseHandler(
  response.count,
  async (req: RequestValidator<NFTContractTxnCountReq>) => {
    const contract = req.validator.contract;
    const affected = req.validator.affected;
    const before = req.validator.before_ts;

    const txns = await dbEvents.one<NFTContractTxnCount>(sql.contractTxnCount, {
      affected,
      before,
      contract,
    });

    return { data: txns };
  },
);

const holders = responseHandler(
  response.contractHolders,
  async (req: RequestValidator<NFTContractHoldersReq>) => {
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

    const data = await dbEvents.manyOrNone<NFTContractHolders>(sql.holders, {
      contract,
      cursor: {
        account: cursor?.account,
        quantity: cursor?.quantity,
      },
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
    });

    return paginateData(
      data,
      limit,
      direction,
      (holder) => ({
        account: holder.account,
        quantity: holder.quantity,
      }),
      !!cursor,
    );
  },
);

const holderCount = responseHandler(
  response.contractHolderCount,
  async (req: RequestValidator<NFTContractHolderCountReq>) => {
    const contract = req.validator.contract;

    const data = await dbEvents.one<NFTContractHolderCount>(sql.holderCount, {
      contract,
    });

    return { data };
  },
);

export default { contract, holderCount, holders, txnCount, txns };
