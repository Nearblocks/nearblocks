import { Router } from 'express';

import accounts from '#routes/v3/accounts/index';
import blocks from '#routes/v3/blocks';
import fts from '#routes/v3/fts/index';
import keys from '#routes/v3/keys';
import mts from '#routes/v3/mts';
import multichain from '#routes/v3/multichain/index';
import nfts from '#routes/v3/nfts/index';
import receipts from '#routes/v3/receipts';
import search from '#routes/v3/search';
import staking from '#routes/v3/staking';
import stats from '#routes/v3/stats';
import sync from '#routes/v3/sync';
import txns from '#routes/v3/txns';

const routes = () => {
  const app = Router();

  accounts(app);
  blocks(app);
  fts(app);
  keys(app);
  mts(app);
  multichain(app);
  nfts(app);
  receipts(app);
  search(app);
  staking(app);
  stats(app);
  sync(app);
  txns(app);

  return app;
};

export default routes;
