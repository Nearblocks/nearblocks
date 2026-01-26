import { sql } from '#sql/index';

export default {
  account: sql('queries/accounts/account.sql'),
  assets: {
    ftCount: sql('queries/accounts/assets/ftCount.sql'),
    fts: sql('queries/accounts/assets/fts.sql'),
    nftCount: sql('queries/accounts/assets/nftCount.sql'),
    nfts: sql('queries/accounts/assets/nfts.sql'),
  },
  balance: sql('queries/accounts/balance.sql'),
  contracts: {
    action: sql('queries/accounts/contracts/action.sql'),
    contract: sql('queries/accounts/contracts/contract.sql'),
    deployments: sql('queries/accounts/contracts/deployments.sql'),
    deploymentTxn: sql('queries/accounts/contracts/deploymentTxn.sql'),
  },
  fts: {
    estimate: sql('queries/accounts/fts/estimate.sql'),
    txn: sql('queries/accounts/fts/txn.sql'),
    txns: sql('queries/accounts/fts/txns.sql'),
  },
  keys: {
    count: sql('queries/accounts/keys/count.sql'),
    keys: sql('queries/accounts/keys/keys.sql'),
  },
  mts: {
    estimate: sql('queries/accounts/mts/estimate.sql'),
    txn: sql('queries/accounts/mts/txn.sql'),
    txns: sql('queries/accounts/mts/txns.sql'),
  },
  nfts: {
    estimate: sql('queries/accounts/nfts/estimate.sql'),
    txn: sql('queries/accounts/nfts/txn.sql'),
    txns: sql('queries/accounts/nfts/txns.sql'),
  },
  receipts: {
    cte: sql('queries/accounts/receipts/cte.sql'),
    cteUnion: sql('queries/accounts/receipts/cteUnion.sql'),
    estimate: sql('queries/accounts/receipts/estimate.sql'),
    receipts: sql('queries/accounts/receipts/receipts.sql'),
  },
  staking: {
    estimate: sql('queries/accounts/staking/estimate.sql'),
    txn: sql('queries/accounts/staking/txn.sql'),
    txns: sql('queries/accounts/staking/txns.sql'),
  },
  stats: {
    balance: sql('queries/accounts/stats/balance.sql'),
    fts: sql('queries/accounts/stats/fts.sql'),
    near: sql('queries/accounts/stats/near.sql'),
    overview: sql('queries/accounts/stats/overview.sql'),
    txns: sql('queries/accounts/stats/txns.sql'),
  },
  txns: {
    cte: sql('queries/accounts/txns/cte.sql'),
    cteUnion: sql('queries/accounts/txns/cteUnion.sql'),
    estimate: sql('queries/accounts/txns/estimate.sql'),
    txns: sql('queries/accounts/txns/txns.sql'),
  },
};
