import Big from 'big.js';
import { providers } from 'near-api-js';

export function isValidJson(value: string): boolean {
  try {
    const parsed = JSON.parse(value);

    return parsed && typeof parsed === 'object';
  } catch (e) {
    return false;
  }
}

export const parseEventJson = (log: string) => {
  if (!log?.startsWith('EVENT_JSON:')) return log;

  const jsonString = log.replace('EVENT_JSON:', '').trim();

  if (typeof jsonString !== 'string') {
    throw new Error('jsonString is not a valid string');
  }

  if (!isValidJson(jsonString)) {
    const fixedJsonString = jsonString.replace(/\\"/g, '"');

    if (isValidJson(fixedJsonString)) {
      return JSON.parse(fixedJsonString);
    } else {
      return null;
    }
  }

  return JSON.parse(jsonString);
};

export function shortenHex(address: string) {
  return `${address && address?.slice(0, 6)}...${address?.slice(-4)}`;
}

export const shortenAddress = (address: string, length = 8): string => {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export function localFormat(number: string) {
  const bigNumber = Big(number);
  const formattedNumber = bigNumber
    .toFixed(6)
    .replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  return formattedNumber.replace(/\.?0*$/, '');
}

export function yoctoToNear(yocto: string, format: boolean) {
  const YOCTO_PER_NEAR = Big(10).pow(24)?.toString();

  const near = Big(yocto)?.div(YOCTO_PER_NEAR)?.toString();

  return format ? localFormat(near) : near;
}
export const cleanJsonString = (str: string): string => {
  if (typeof str !== 'string') return str;

  return str
    .replace(/\\+/g, '')
    .replace(/"{2,}/g, '"')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
};

export const cleanNestedObject = (obj: any): any => {
  if (typeof obj === 'string') {
    const cleaned = cleanJsonString(obj);
    if (
      (cleaned.startsWith('{') && cleaned.endsWith('}')) ||
      (cleaned.startsWith('[') && cleaned.endsWith(']'))
    ) {
      try {
        return JSON.parse(cleaned);
      } catch {
        return cleaned;
      }
    }
    return cleaned;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanNestedObject(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const key in obj) {
      result[key] = cleanNestedObject(obj[key]);
    }
    return result;
  }

  return obj;
};

export function shouldUseRpc(height: number = 0): boolean {
  const networkId = process.env.NETWORK;

  return (
    (networkId === 'testnet' && height <= 192373963) ||
    (networkId === 'mainnet' && height <= 143997621)
  );
}

export const getFailoverProvider = (networkId: string) => {
  const urls =
    networkId === 'mainnet'
      ? [
          'https://archival-rpc.mainnet.fastnear.com',
          'https://archival-rpc.mainnet.near.org',
          'https://rpc.mainnet.near.org',
          'https://free.rpc.fastnear.com',
          'https://near.lava.build',
          'https://near.drpc.org',
        ]
      : [
          'https://archival-rpc.testnet.near.org',
          'https://rpc.testnet.near.org',
        ];

  const providersArray = urls.map(
    (url) => new providers.JsonRpcProvider({ url }, { retries: 0 }),
  );

  return new providers.FailoverRpcProvider(providersArray);
};
