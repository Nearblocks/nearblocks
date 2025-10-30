import type {
  AccountAssetFT,
  AccountAssetFTCount,
  AccountAssetFTCountReq,
  AccountAssetFTsReq,
  AccountAssetNFT,
  AccountAssetNFTCount,
  AccountAssetNFTCountReq,
  AccountAssetNFTsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/assets/request.js';
import response from 'nb-schemas/dist/accounts/assets/response.js';

import cursors from '#libs/cursors';
import { dbEvents } from '#libs/pgp';
import { paginateData } from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/accounts';

const fts = responseHandler(
  response.fts,
  async (req: RequestValidator<AccountAssetFTsReq>) => {
    const account = req.validator.account;
    const limit = req.validator.limit;
    const cursor = req.validator.cursor
      ? cursors.decode(request.ftsCursor, req.validator.cursor)
      : null;

    const fts = await dbEvents.manyOrNone<AccountAssetFT>(sql.assets.fts, {
      account,
      cursor: {
        amount: cursor?.amount,
        contract: cursor?.contract,
      },
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
    });

    return paginateData(fts, limit, (ft) => ({
      amount: ft.amount,
      contract: ft.contract,
    }));
  },
);

const ftCount = responseHandler(
  response.ftCount,
  async (req: RequestValidator<AccountAssetFTCountReq>) => {
    const account = req.validator.account;

    const count = await dbEvents.one<AccountAssetFTCount>(sql.assets.ftCount, {
      account,
    });

    return { data: count };
  },
);

const nfts = responseHandler(
  response.nfts,
  async (req: RequestValidator<AccountAssetNFTsReq>) => {
    const account = req.validator.account;
    const limit = req.validator.limit;
    const cursor = req.validator.cursor
      ? cursors.decode(request.nftsCursor, req.validator.cursor)
      : null;

    const nfts = await dbEvents.manyOrNone<AccountAssetNFT>(sql.assets.nfts, {
      account,
      cursor: {
        contract: cursor?.contract,
        token: cursor?.token,
      },
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
    });

    return paginateData(nfts, limit, (nft) => ({
      contract: nft.contract,
      token: nft.token,
    }));
  },
);

const nftCount = responseHandler(
  response.nftCount,
  async (req: RequestValidator<AccountAssetNFTCountReq>) => {
    const account = req.validator.account;

    const count = await dbEvents.one<AccountAssetNFTCount>(
      sql.assets.nftCount,
      {
        account,
      },
    );

    return { data: count };
  },
);

export default { ftCount, fts, nftCount, nfts };
