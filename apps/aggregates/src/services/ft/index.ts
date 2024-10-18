import { syncHolders } from './holders.js';

export const syncFT = async () => {
  return Promise.all([syncHolders()]);
};
