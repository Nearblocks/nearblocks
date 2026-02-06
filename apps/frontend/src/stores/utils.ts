import type { StateStorage } from 'zustand/middleware';

import type { Network } from '@/types/enums';

let currentNetwork: Network | null = null;

export const setCurrentNetwork = (network: Network) => {
  currentNetwork = network;
};

export const getCurrentNetwork = () => currentNetwork;

export const createNetworkStorage = (baseKey: string): StateStorage => ({
  getItem: (name) => {
    if (name === baseKey && !currentNetwork) return null;
    const key = name === baseKey ? `${baseKey}:${currentNetwork}` : name;
    return localStorage.getItem(key);
  },
  removeItem: (name) => {
    if (name === baseKey && !currentNetwork) return;
    const key = name === baseKey ? `${baseKey}:${currentNetwork}` : name;
    localStorage.removeItem(key);
  },
  setItem: (name, value) => {
    if (name === baseKey && !currentNetwork) return;
    const key = name === baseKey ? `${baseKey}:${currentNetwork}` : name;
    localStorage.setItem(key, value);
  },
});
