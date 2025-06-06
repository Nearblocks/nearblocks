import { intentsAddressList } from './app/config';
import { supportedNetworks } from './app/config';
import { NetworkType } from './types';

export const networkFullNames: any = supportedNetworks;

export function getNetworkDetails(input: string): string {
  const matchedKey = Object.keys(intentsAddressList).find(
    (key) => intentsAddressList[key] === input,
  );

  if (!matchedKey) {
    return '';
  }

  const network = matchedKey.includes('-')
    ? matchedKey.split('-')[0]
    : matchedKey;

  if (isExplorerNetwork(network)) {
    return networkFullNames[network];
  }

  return '';
}

function isExplorerNetwork(value: string): value is NetworkType {
  return Object.keys(networkFullNames).includes(value);
}
