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

import config from '#config';
import { dbBase, dbEvents } from '#libs/pgp';
import { rollingWindowList } from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/search';

const ACCOUNT_ID_REGEX =
  /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;
const BLOCK_HEIGHT_LIMIT = 1_000_000_000_000n;

const normalizeKeyword = (keyword: string) => keyword.trim();

const isValidAccountId = (account: string) => {
  return (
    account !== 'system' &&
    account.length >= 2 &&
    account.length <= 64 &&
    ACCOUNT_ID_REGEX.test(account)
  );
};

const isValidBase58Hash = (hash: string) => {
  return hash.length >= 43 && hash.length <= 44 && BASE58_REGEX.test(hash);
};

const isValidBlockHeight = (height: string) => {
  return /^[0-9]+$/.test(height) && BigInt(height) <= BLOCK_HEIGHT_LIMIT;
};

const isValidHexAddress = (address: string) => {
  return /^0x[a-f0-9]{40}$/.test(address);
};

const isValidRlpHash = (hash: string) => {
  return /^0x[a-f0-9]{64}$/.test(hash);
};

const isValidPublicKey = (key: string) => {
  const [curve, value] = key.split(':');

  return (
    (curve === 'ed25519' || curve === 'secp256k1') &&
    value.length >= 43 &&
    value.length <= 88 &&
    BASE58_REGEX.test(value)
  );
};

const raceNonEmpty = <T>(promises: Promise<T[]>[]): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    let pending = promises.length;

    promises.forEach((p) => {
      p.then((result) => {
        if (result.length > 0) {
          resolve(result);
          return;
        }
        pending -= 1;
        if (pending === 0) resolve([]);
      }).catch((err) => {
        pending -= 1;
        if (pending === 0) reject(err);
      });
    });
  });
};

const getAccounts = async (keyword: string) => {
  const query = keyword.toLowerCase();

  if (!isValidAccountId(query)) return [];

  return raceNonEmpty([
    dbBase.manyOrNone<SearchAccount>(sql.account, { account: query }),
    dbBase.manyOrNone<SearchAccount>(sql.accounts, { account: query }),
  ]);
};

const getKeys = async (keyword: string) => {
  if (!isValidPublicKey(keyword)) return [];

  return dbBase.manyOrNone<SearchKey>(sql.keys, {
    key: keyword,
  });
};

const getFts = async (keyword: string) => {
  const query = keyword.toLowerCase();
  const hex = isValidHexAddress(query) ? query : null;
  const contract = isValidAccountId(query) ? query : null;

  if (!hex && !contract) return [];

  return dbEvents.manyOrNone<SearchFT>(sql.fts, {
    contract,
    hex,
  });
};

const getNfts = async (keyword: string) => {
  const query = keyword.toLowerCase();

  if (!isValidAccountId(query)) return [];

  return dbEvents.manyOrNone<SearchNFT>(sql.nfts, {
    contract: query,
  });
};

const getBlocks = async (keyword: string) => {
  const hash = isValidBase58Hash(keyword) ? keyword : null;
  const height = isValidBlockHeight(keyword) ? +keyword : null;

  if (!hash && height === null) return [];

  return rollingWindowList(
    (start, end) => {
      return dbBase.manyOrNone<SearchBlock>(sql.blocks, {
        end,
        hash,
        height,
        limit: 1,
        start,
      });
    },
    { start: config.baseStart },
  );
};

const getReceipts = async (keyword: string) => {
  if (!isValidBase58Hash(keyword)) return [];

  return rollingWindowList(
    (start, end) => {
      return dbBase.manyOrNone<SearchReceipt>(sql.receipts, {
        end,
        limit: 1,
        receipt: keyword,
        start,
      });
    },
    { start: config.baseStart },
  );
};

const getTxns = async (keyword: string) => {
  const query = keyword.toLowerCase();
  const hex = isValidRlpHash(query) ? query : null;
  const hash = isValidBase58Hash(keyword) ? keyword : null;

  if (!hex && !hash) return [];

  return rollingWindowList(
    (start, end) => {
      return dbBase.manyOrNone<SearchTxn>(hex ? sql.rlp : sql.txns, {
        end,
        hash: hex ?? hash,
        limit: 1,
        start,
      });
    },
    { start: config.baseStart },
  );
};

const accounts = responseHandler(
  response.accounts,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = normalizeKeyword(req.validator.keyword);

    const accounts = await getAccounts(keyword);

    return { data: accounts };
  },
);

const blocks = responseHandler(
  response.blocks,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = normalizeKeyword(req.validator.keyword);

    const blocks = await getBlocks(keyword);

    return { data: blocks };
  },
);

const keys = responseHandler(
  response.keys,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = normalizeKeyword(req.validator.keyword);

    const keys = await getKeys(keyword);

    return { data: keys };
  },
);

const fts = responseHandler(
  response.fts,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = normalizeKeyword(req.validator.keyword);

    const fts = await getFts(keyword);

    return { data: fts };
  },
);

const nfts = responseHandler(
  response.nfts,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = normalizeKeyword(req.validator.keyword);

    const nfts = await getNfts(keyword);

    return { data: nfts };
  },
);

const receipts = responseHandler(
  response.receipts,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = normalizeKeyword(req.validator.keyword);

    const receipts = await getReceipts(keyword);

    return { data: receipts };
  },
);

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = normalizeKeyword(req.validator.keyword);

    const txns = await getTxns(keyword);

    return { data: txns };
  },
);

const search = responseHandler(
  response.search,
  async (req: RequestValidator<SearchReq>) => {
    const keyword = normalizeKeyword(req.validator.keyword);

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
