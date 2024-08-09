import { Router } from 'express';

import account from '#routes/account';
import analytics from '#routes/analytics';
import blocks from '#routes/blocks';
import charts from '#routes/charts';
import dex from '#routes/dex';
import exports from '#routes/exports';
import fts from '#routes/fts';
import keys from '#routes/keys';
import kitwallet from '#routes/kitwallet';
import legacy from '#routes/legacy';
import nfts from '#routes/nfts';
import node from '#routes/node';
import search from '#routes/search';
import stats from '#routes/stats';
import sync from '#routes/sync';
import txns from '#routes/txns';
import validators from '#routes/validators';

const routes = () => {
  const app = Router();

  account(app);
  analytics(app);
  blocks(app);
  charts(app);
  dex(app);
  exports(app);
  fts(app);
  keys(app);
  kitwallet(app);
  legacy(app);
  nfts(app);
  node(app);
  search(app);
  stats(app);
  sync(app);
  txns(app);
  validators(app);

  return app;
};

export default routes;
