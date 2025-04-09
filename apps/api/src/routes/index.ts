import { Router } from 'express';

import account from '#routes/account';
import accounts from '#routes/accounts';
import analytics from '#routes/analytics';
import blocks from '#routes/blocks';
import campaigns from '#routes/campaigns';
import chainAbstraction from '#routes/chain-abstraction';
import charts from '#routes/charts';
import dex from '#routes/dex';
import exports from '#routes/exports';
import fts from '#routes/fts';
import health from '#routes/health';
import keys from '#routes/keys';
import kitwallet from '#routes/kitwallet';
import legacy from '#routes/legacy';
import nfts from '#routes/nfts';
import search from '#routes/search';
import stats from '#routes/stats';
import sync from '#routes/sync';
import txns from '#routes/txns';
import validators from '#routes/validators';

const routes = () => {
  const app = Router();

  account(app);
  accounts(app);
  analytics(app);
  blocks(app);
  charts(app);
  dex(app);
  exports(app);
  fts(app);
  health(app);
  keys(app);
  kitwallet(app);
  legacy(app);
  nfts(app);
  search(app);
  stats(app);
  sync(app);
  txns(app);
  validators(app);
  campaigns(app);
  chainAbstraction(app);

  return app;
};

export default routes;
