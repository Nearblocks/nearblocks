import { sql } from '#sql/index';

export default {
  accounts: sql('queries/kitwallet/accounts.sql'),
  deposits: sql('queries/kitwallet/deposits.sql'),
  lastBlock: sql('queries/kitwallet/last-block.sql'),
  nfts: sql('queries/kitwallet/nfts.sql'),
  pools: sql('queries/kitwallet/pools.sql'),
  tokens: sql('queries/kitwallet/tokens.sql'),
  tokensFrom: sql('queries/kitwallet/tokens-from.sql'),
};
