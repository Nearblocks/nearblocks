import { Router } from 'express';

import fts from '#routes/fts';
import txns from '#routes/txns';
import nfts from '#routes/nfts';
import stats from '#routes/stats';
import api from '#routes/api/index';
import blocks from '#routes/blocks';
import charts from '#routes/charts';
import search from '#routes/search';
import account from '#routes/account';
import exports from '#routes/exports';

const routes = () => {
  const app = Router();

  api(app);
  blocks(app);
  txns(app);
  account(app);
  exports(app);
  fts(app);
  nfts(app);
  stats(app);
  charts(app);
  search(app);

  return app;
};

export default routes;
