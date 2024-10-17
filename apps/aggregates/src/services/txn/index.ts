import { syncTPS } from './tps.js';

export const syncTxn = async () => {
  return Promise.all([syncTPS()]);
};
