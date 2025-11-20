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
    const next = req.validator.next
      ? cursors.decode(request.ftsCursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.ftsCursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const fts = await dbEvents.manyOrNone<AccountAssetFT>(sql.assets.fts, {
      account,
      cursor: {
        amount: cursor?.amount,
        contract: cursor?.contract,
      },
      direction,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
    });

    return paginateData(
      fts,
      limit,
      direction,
      (ft) => ({
        amount: ft.amount,
        contract: ft.contract,
      }),
      !!cursor,
    );
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
    const next = req.validator.next
      ? cursors.decode(request.nftsCursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.nftsCursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const nfts = await dbEvents.manyOrNone<AccountAssetNFT>(sql.assets.nfts, {
      account,
      cursor: {
        contract: cursor?.contract,
        token: cursor?.token,
      },
      direction,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
    });

    return paginateData(
      nfts,
      limit,
      direction,
      (nft) => ({
        contract: nft.contract,
        token: nft.token,
      }),
      !!cursor,
    );
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
