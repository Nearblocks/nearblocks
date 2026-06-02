import type {
  AccountAssetFT,
  AccountAssetFTCount,
  AccountAssetFTCountReq,
  AccountAssetFTsReq,
  AccountAssetMTFT,
  AccountAssetMTFTCount,
  AccountAssetMTFTCountReq,
  AccountAssetMTFTsReq,
  AccountAssetMTNFT,
  AccountAssetMTNFTCount,
  AccountAssetMTNFTCountReq,
  AccountAssetMTNFTsReq,
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

    const fts = await dbEvents.manyOrNone<AccountAssetFT & { value: string }>(
      sql.assets.fts,
      {
        account,
        cursor: {
          contract: cursor?.contract,
          value: cursor?.value,
        },
        direction,
        // Fetch one extra to check if there is a next page
        limit: limit + 1,
      },
    );

    return paginateData(
      fts,
      limit,
      direction,
      (ft) => ({
        contract: ft.contract,
        value: ft.value,
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

const mtFts = responseHandler(
  response.mtFts,
  async (req: RequestValidator<AccountAssetMTFTsReq>) => {
    const account = req.validator.account;
    const contract = req.validator.contract ?? null;
    const token = req.validator.token ?? null;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.mtFtsCursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.mtFtsCursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const contractDirection = prev ? 'desc' : 'asc';
    const tokenDirection = prev ? 'desc' : 'asc';
    const cursor = prev || next;

    const data = await dbEvents.manyOrNone<
      AccountAssetMTFT & { value: string }
    >(sql.assets.mtFts, {
      account,
      contract,
      contractDirection,
      cursor: {
        contract: cursor?.contract,
        token: cursor?.token,
        value: cursor?.value,
      },
      direction,
      limit: limit + 1,
      token,
      tokenDirection,
    });

    return paginateData(
      data,
      limit,
      direction,
      (mt) => ({
        contract: mt.contract,
        token: mt.token,
        value: mt.value,
      }),
      !!cursor,
    );
  },
);

const mtFtCount = responseHandler(
  response.mtFtCount,
  async (req: RequestValidator<AccountAssetMTFTCountReq>) => {
    const account = req.validator.account;

    const count = await dbEvents.one<AccountAssetMTFTCount>(
      sql.assets.mtFtCount,
      {
        account,
      },
    );

    return { data: count };
  },
);

const mtNfts = responseHandler(
  response.mtNfts,
  async (req: RequestValidator<AccountAssetMTNFTsReq>) => {
    const account = req.validator.account;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.mtNftsCursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.mtNftsCursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const contractDirection = prev ? 'desc' : 'asc';
    const cursor = prev || next;

    const data = await dbEvents.manyOrNone<AccountAssetMTNFT>(
      sql.assets.mtNfts,
      {
        account,
        contractDirection,
        cursor: {
          contract: cursor?.contract,
          token: cursor?.token,
        },
        direction,
        limit: limit + 1,
      },
    );

    return paginateData(
      data,
      limit,
      direction,
      (mt) => ({
        contract: mt.contract,
        token: mt.token,
      }),
      !!cursor,
    );
  },
);

const mtNftCount = responseHandler(
  response.mtNftCount,
  async (req: RequestValidator<AccountAssetMTNFTCountReq>) => {
    const account = req.validator.account;

    const count = await dbEvents.one<AccountAssetMTNFTCount>(
      sql.assets.mtNftCount,
      {
        account,
      },
    );

    return { data: count };
  },
);

export default {
  ftCount,
  fts,
  mtFtCount,
  mtFts,
  mtNftCount,
  mtNfts,
  nftCount,
  nfts,
};
