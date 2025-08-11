import type {
  SearchAccount,
  SearchBlock,
  SearchFt,
  SearchKey,
  SearchNft,
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
  return dbBase.manyOrNone<SearchAccount>(sql.accounts, {
    account: keyword.toLowerCase(),
  });
};

const getKeys = async (keyword: string) => {
  return dbBase.manyOrNone<SearchKey>(sql.keys, {
    key: keyword.toLowerCase(),
  });
};

const getFts = async (keyword: string) => {
  return dbEvents.manyOrNone<SearchFt>(sql.fts, {
    contract: keyword.toLowerCase(),
  });
};

const getNfts = async (keyword: string) => {
  return dbEvents.manyOrNone<SearchNft>(sql.nfts, {
    contract: keyword.toLowerCase(),
  });
};

const getBlocks = async (keyword: string) => {
  const query = keyword.replace(/^0x/, '');
  const hash = query.length >= 43 ? query.toLowerCase() : null;
  const height = !isNaN(+query) ? +query : null;

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
      receipt: keyword.toLowerCase(),
      start,
    });
  });
};

const getTxns = async (keyword: string) => {
  return rollingWindowList((start, end) => {
    return dbBase.manyOrNone<SearchTxn>(
      keyword.startsWith('0x') ? sql.rlp : sql.txns,
      {
        end,
        hash: keyword.toLowerCase(),
        limit: 1,
        start,
      },
    );
  });
};

const accounts = responseHandler(
  response.txns,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const accounts = await getAccounts(keyword);

    return { data: accounts };
  },
);

const blocks = responseHandler(
  response.txns,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const blocks = await getBlocks(keyword);

    return { data: blocks };
  },
);

const fts = responseHandler(
  response.txns,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const fts = await getFts(keyword);

    return { data: fts };
  },
);

const keys = responseHandler(
  response.txns,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const keys = await getBlocks(keyword);

    return { data: keys };
  },
);

const nfts = responseHandler(
  response.txns,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const nfts = await getNfts(keyword);

    return { data: nfts };
  },
);

const receipts = responseHandler(
  response.txns,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const receipts = await getBlocks(keyword);

    return { data: receipts };
  },
);

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const txns = await getBlocks(keyword);

    return { data: txns };
  },
);

const search = responseHandler(
  response.search,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = req.validator.keyword;

    const [accounts, blocks, fts, keys, nfts, receipts, txns] =
      await Promise.all([
        getAccounts(keyword),
        getBlocks(keyword),
        getFts(keyword),
        getKeys(keyword),
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
