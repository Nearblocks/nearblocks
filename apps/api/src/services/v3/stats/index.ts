import type {
  AddressStats,
  AddressStatsReq,
  BlockStatsReq,
  DailyBlockStats,
  DailyTxnStats,
  PriceStats,
  PriceStatsReq,
  SignerStats,
  SignerStatsReq,
  Stats,
  TpsStats,
  TpsStatsReq,
  TxnStatsReq,
} from 'nb-schemas';
import response from 'nb-schemas/dist/stats/response.js';

import { dbBase, dbContract } from '#libs/pgp';
import { msToNsTime } from '#libs/utils';
import { responseHandler } from '#middlewares/response';
import { RequestValidator } from '#middlewares/validate';
import sql from '#sql/stats';

const stats = responseHandler(response.stats, async () => {
  const data = await dbBase.one<Stats>(sql.stats);

  return { data };
});

const block = responseHandler(
  response.block,
  async (req: RequestValidator<BlockStatsReq>) => {
    const limit = req.validator.limit;
    const date = req.validator.date
      ? msToNsTime(new Date(`${req.validator.date}T00:00:00Z`).getTime())
      : null;

    const data = await dbBase.manyOrNone<DailyBlockStats>(sql.block, {
      date,
      limit,
    });

    return { data };
  },
);

const txn = responseHandler(
  response.txn,
  async (req: RequestValidator<TxnStatsReq>) => {
    const limit = req.validator.limit;
    const date = req.validator.date
      ? msToNsTime(new Date(`${req.validator.date}T00:00:00Z`).getTime())
      : null;

    const data = await dbBase.manyOrNone<DailyTxnStats>(sql.txn, {
      date,
      limit,
    });

    return { data };
  },
);

const address = responseHandler(
  response.address,
  async (req: RequestValidator<AddressStatsReq>) => {
    const limit = req.validator.limit;
    const date = req.validator.date
      ? msToNsTime(new Date(`${req.validator.date}T00:00:00Z`).getTime())
      : null;

    const [actions, contracts] = await Promise.all([
      dbBase.manyOrNone<Omit<AddressStats, 'new_contracts'>>(sql.address, {
        date,
        limit,
      }),
      dbContract.manyOrNone<{ date: string; new_contracts: number }>(
        sql.contract,
        { date, limit },
      ),
    ]);

    const contractsByDate = new Map(
      contracts.map((row) => [row.date, row.new_contracts]),
    );

    const data: AddressStats[] = actions.map((row) => ({
      ...row,
      new_contracts: contractsByDate.get(row.date) ?? null,
    }));

    return { data };
  },
);

const price = responseHandler(
  response.price,
  async (req: RequestValidator<PriceStatsReq>) => {
    const limit = req.validator.limit;
    const date = req.validator.date
      ? msToNsTime(new Date(`${req.validator.date}T00:00:00Z`).getTime())
      : null;

    const data = await dbBase.manyOrNone<PriceStats>(sql.price, {
      date,
      limit,
    });

    return { data };
  },
);

const signer = responseHandler(
  response.signer,
  async (req: RequestValidator<SignerStatsReq>) => {
    const limit = req.validator.limit;
    const date = req.validator.date
      ? msToNsTime(new Date(`${req.validator.date}T00:00:00Z`).getTime())
      : null;

    const data = await dbBase.manyOrNone<SignerStats>(sql.signer, {
      date,
      limit,
    });

    return { data };
  },
);

const tps = responseHandler(
  response.tps,
  async (req: RequestValidator<TpsStatsReq>) => {
    const limit = req.validator.limit ?? 60;
    const data = await dbBase.manyOrNone<TpsStats>(sql.tps, { limit });

    return { data };
  },
);

export default { address, block, price, signer, stats, tps, txn };
