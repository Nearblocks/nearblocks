import { Router } from 'express';

import account from '#routes/account';
import api from '#routes/api/index';
import blocks from '#routes/blocks';
import charts from '#routes/charts';
import exports from '#routes/exports';
import fts from '#routes/fts';
import key from '#routes/key';
import nfts from '#routes/nfts';
import node from '#routes/node';
import search from '#routes/search';
import stats from '#routes/stats';
import txns from '#routes/txns';
import validators from '#routes/validators';

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
  key(app);
  validators(app);
  node(app);

  return app;
};

export default routes;
