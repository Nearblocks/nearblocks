import { intentsAddressList } from './app/config';
import { supportedNetworks } from './app/config';
import {
  ApiTransactionInfo,
  NetworkType,
  ProcessedTokenMeta,
  TokenMetadataMap,
} from './types';

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

export function txnAllActions(txn: ApiTransactionInfo) {
  const txActions = [];

  try {
    const receipts = txn?.receipts || [];

    for (let i = 0; i < receipts.length; i++) {
      const receipt = receipts[i] as any;
      const from = receipt?.predecessor_account_id;
      const to = receipt?.receiver_account_id;
      const receiptId = receipt?.receipt_id;

      if (!from || !to || from === 'system') continue;

      const actions = receipt?.actions || [];

      for (const action of actions) {
        let parsedArgs: Record<string, any> = {};
        try {
          parsedArgs = action.args ? JSON.parse(action.args) : {};
        } catch (err) {
          parsedArgs = { _error: 'Invalid JSON in args' };
        }

        txActions.push({
          from,
          to,
          receiptId,
          action: action.action,
          method: action.method || null,
          args: parsedArgs,
        });
      }
    }
  } catch (err) {
    console.error('Error in txnAllActions:', err);
  }

  return txActions;
}

export default function toTokenMetadataMap(
  metaList: ProcessedTokenMeta[],
): TokenMetadataMap {
  return metaList.reduce((acc, item) => {
    acc[item.contractId] = item.metadata;
    return acc;
  }, {} as TokenMetadataMap);
}
