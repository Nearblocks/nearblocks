import { NextFunction, Request, Response, Router } from 'express';

import config from '#config';
import { setDeprecationHeaders } from '#middlewares/legacyApi';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import compat from '#services/compat/index';

/**
 * Limited v1/v2 compatibility, served from v3 between the legacy sunset and
 * config.legacyCompatRemoval. Only these routes; everything else under /v1
 * and /v2 falls through to legacyApi (410). Delete this folder and its mount
 * in app.ts to remove it. See docs/v3-migration.md.
 */

// v3's maximum page size (nb-schemas limitSchema).
const MAX_PER_PAGE = 100;
const LEGACY_PARAM = /^(after|before)_/;
const NUMERIC = /^\d+$/;

const active = (_req: Request, _res: Response, next: NextFunction) => {
  const now = Date.now();
  const on =
    now >= config.legacyApiSunset.getTime() &&
    now < config.legacyCompatRemoval.getTime();
  return next(on ? undefined : 'route');
};

// /v1/txns/count and /latest are not part of compat.
const txnHash = (req: Request, _res: Response, next: NextFunction) =>
  next(['count', 'latest'].includes(req.params.hash) ? 'route' : undefined);

const reject = (res: Response, message: string) =>
  res.status(422).json({ data: null, errors: [{ message }] });

const prepare = (req: Request, res: Response, next: NextFunction) => {
  setDeprecationHeaders(res);
  res.setHeader('NearBlocks-Compat', 'limited');
  res.setHeader(
    'NearBlocks-Compat-Removal',
    config.legacyCompatRemoval.toISOString().slice(0, 10),
  );
  res.locals.usageVersion = 'compat';

  const { cursor, order, page, per_page } = req.query;
  const legacy = Object.keys(req.query).find((key) => LEGACY_PARAM.test(key));
  if (legacy) return reject(res, `${legacy}: not supported; use cursor.`);
  if (page !== undefined && Number(page) !== 1)
    return reject(res, 'page: only the first page; use cursor.');
  if (order !== undefined && order !== 'desc')
    return reject(res, 'order: only desc is supported.');
  if (cursor !== undefined && NUMERIC.test(String(cursor)))
    return reject(res, 'cursor: v1 cursors are not supported; restart paging.');

  if (Number(per_page) > MAX_PER_PAGE) {
    // Capped before rateLimiter, so credits match what is returned.
    req.query = { ...req.query, per_page: String(MAX_PER_PAGE) };
  }
  return next();
};

const routes = () => {
  const router = Router();
  const chain = [active, bearerAuth, prepare, rateLimiter];

  router.get('/v1/account/:account', chain, compat.account);
  router.get('/v1/account/:account/txns', chain, compat.txns);
  router.get('/v1/account/:account/txns-only', chain, compat.txnsOnly);
  router.get('/v1/account/:account/receipts', chain, compat.receipts);
  router.get('/v1/account/:account/ft-txns', chain, compat.ftTxns);
  router.get('/v1/account/:account/inventory', chain, compat.inventory);
  router.get('/v1/txns/:hash', txnHash, chain, compat.txnV1);
  router.get('/v2/txns/:hash', chain, compat.txnV2);
  router.get('/v1/blocks/latest', chain, compat.blocksLatest);
  router.get('/v1/stats', chain, compat.stats);

  return router;
};

export default routes;
