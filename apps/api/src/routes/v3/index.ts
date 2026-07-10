import { Router } from 'express';

import accounts from '#routes/v3/accounts/index';
import blocks from '#routes/v3/blocks';
import fts from '#routes/v3/fts/index';
import intents from '#routes/v3/intents/index';
import keys from '#routes/v3/keys';
import kitwallet from '#routes/v3/kitwallet';
import mtsContract from '#routes/v3/mts/contract';
import mts from '#routes/v3/mts/index';
import multichain from '#routes/v3/multichain/index';
import nfts from '#routes/v3/nfts/index';
import receipts from '#routes/v3/receipts';
import search from '#routes/v3/search';
import staking from '#routes/v3/staking';
import stats from '#routes/v3/stats';
import sync from '#routes/v3/sync';
import txns from '#routes/v3/txns';
import validators from '#routes/v3/validators';

const routes = () => {
  const app = Router();

  accounts(app);
  blocks(app);
  fts(app);
  intents(app);
  keys(app);
  kitwallet(app);
  mts(app);
  mtsContract(app);
  multichain(app);
  nfts(app);
  receipts(app);
  search(app);
  staking(app);
  stats(app);
  sync(app);
  txns(app);
  validators(app);

  return app;
};

export default routes;
