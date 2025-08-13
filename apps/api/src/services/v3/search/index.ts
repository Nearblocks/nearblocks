import type {
  SearchAccount,
  SearchBlock,
  SearchFT,
  SearchKey,
  SearchNFT,
  SearchReceipt,
  SearchReq,
  SearchTxn,
} from 'nb-schemas';
import response from 'nb-schemas/dist/search/response.js';

import { dbBase, dbEvents } from '#libs/pgp';
import { rollingWindowList } from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/search';

const getAccounts = async (keyword: string) => {
  const query = keyword.toLowerCase();

  return dbBase.manyOrNone<SearchAccount>(sql.accounts, {
    account: query,
  });
};

const getKeys = async (keyword: string) => {
  return dbBase.manyOrNone<SearchKey>(sql.keys, {
    key: keyword,
  });
};

const getFts = async (keyword: string) => {
  const query = keyword.toLowerCase();

  return dbEvents.manyOrNone<SearchFT>(sql.fts, {
    contract: query,
    hex: /^0x/.test(query) ? query : null,
  });
};

const getNfts = async (keyword: string) => {
  const query = keyword.toLowerCase();

  return dbEvents.manyOrNone<SearchNFT>(sql.nfts, {
    contract: query,
  });
};

const getBlocks = async (keyword: string) => {
  const hash = keyword.length >= 43 ? keyword : null;
  const height =
    /^[0-9]+$/.test(keyword) && BigInt(keyword) <= 1000_000_000_000n
      ? +keyword
      : null;

  return rollingWindowList((start, end) => {
    return dbBase.manyOrNone<SearchBlock>(sql.blocks, {
      end,
      hash,
      height,
      limit: 1,
      start,
    });
  });
};

const getReceipts = async (keyword: string) => {
  return rollingWindowList((start, end) => {
    return dbBase.manyOrNone<SearchReceipt>(sql.receipts, {
      end,
      limit: 1,
      receipt: keyword,
      start,
    });
  });
};

const getTxns = async (keyword: string) => {
  const hex = /^0x/i.test(keyword) ? keyword.toLowerCase() : null;

  return rollingWindowList((start, end) => {
    return dbBase.manyOrNone<SearchTxn>(hex ? sql.rlp : sql.txns, {
      end,
      hash: hex ?? keyword,
      limit: 1,
      start,
    });
  });
};

const accounts = responseHandler(
  response.accounts,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const accounts = await getAccounts(keyword);

    return { data: accounts };
  },
);

const blocks = responseHandler(
  response.blocks,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const blocks = await getBlocks(keyword);

    return { data: blocks };
  },
);

const keys = responseHandler(
  response.keys,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const keys = await getKeys(keyword);

    return { data: keys };
  },
);

const fts = responseHandler(
  response.fts,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const fts = await getFts(keyword);

    return { data: fts };
  },
);

const nfts = responseHandler(
  response.nfts,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const nfts = await getNfts(keyword);

    return { data: nfts };
  },
);

const receipts = responseHandler(
  response.receipts,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const receipts = await getReceipts(keyword);

    return { data: receipts };
  },
);

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const txns = await getTxns(keyword);

    return { data: txns };
  },
);

const search = responseHandler(
  response.search,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const [accounts, blocks, keys, fts, nfts, receipts, txns] =
      await Promise.all([
        getAccounts(keyword),
        getBlocks(keyword),
        getKeys(keyword),
        getFts(keyword),
        getNfts(keyword),
        getReceipts(keyword),
        getTxns(keyword),
      ]);

    return {
      data: {
        accounts,
        blocks,
        fts,
        keys,
        nfts,
        receipts,
        txns,
      },
    };
  },
);

export default { accounts, blocks, fts, keys, nfts, receipts, search, txns };
