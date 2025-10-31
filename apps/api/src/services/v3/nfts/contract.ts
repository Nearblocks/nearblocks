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
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;
    const limit = req.validator.limit;
    const cursor = req.validator.cursor
      ? cursors.decode(request.txnCursor, req.validator.cursor)
      : null;

    const eventsQuery: WindowListQuery<
      Omit<NFTContractTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<
        Omit<NFTContractTxn, 'block' | 'transaction_hash'>
      >(sql.contractTxns, {
        affected,
        after: start,
        before: end,
        contract,
        cursor: {
          index: cursor?.index,
          shard: cursor?.shard,
          timestamp: cursor?.timestamp,
        },
        limit,
      });
    };

    const events = await rollingWindowList(eventsQuery, {
      end: cursor?.timestamp
        ? BigInt(cursor.timestamp)
        : before
        ? BigInt(before)
        : undefined,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: after ? BigInt(after) : config.baseStart,
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

      return paginateData(merged, limit, (txn) => ({
        index: txn.event_index,
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
      }));
    }

    return paginateData(txns, limit, (txn) => ({
      index: txn.event_index,
      shard: txn.shard_id,
      timestamp: txn.block_timestamp,
    }));
  },
);

const txnCount = responseHandler(
  response.count,
  async (req: RequestValidator<NFTContractTxnCountReq>) => {
    const contract = req.validator.contract;
    const affected = req.validator.affected;
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;

    const txns = await dbEvents.one<NFTContractTxnCount>(sql.contractTxnCount, {
      affected,
      after,
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
    const cursor = req.validator.cursor
      ? cursors.decode(request.contractHoldersCursor, req.validator.cursor)
      : null;

    const data = await dbEvents.manyOrNone<NFTContractHolders>(sql.holders, {
      contract,
      cursor: {
        account: cursor?.account,
        quantity: cursor?.quantity,
      },
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
    });

    return paginateData(data, limit, (holder) => ({
      account: holder.account,
      quantity: holder.quantity,
    }));
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
