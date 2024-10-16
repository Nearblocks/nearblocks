import { syncFTStats } from './ft.js';
import { syncNearStats } from './near.js';
import { syncTxnStats } from './txn.js';

export const syncAccount = async () => {
  return Promise.all([syncFTStats(), syncNearStats(), syncTxnStats()]);
};
