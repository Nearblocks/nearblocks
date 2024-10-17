import { syncHolders } from './holders.js';

export const syncNFT = async () => {
  return Promise.all([syncHolders()]);
};
