import { localFormat, formatWithCommas } from '@/includes/formats';
import { Debounce, FieldType, FieldValueTypes } from './types';

export function convertAmountToReadableString(amount: string, type: string) {
  if (!amount) return null;

  let value;
  let suffix;

  const nearNomination = new Big(10).pow(24);

  const amountInNear = new Big(amount).div(nearNomination);

  if (type === 'totalSupply' || type === 'totalStakeAmount') {
    value = formatWithCommas(amountInNear.div(1e6).toFixed(1));
    suffix = 'M';
  } else if (type === 'seatPriceAmount') {
    value = formatWithCommas(amountInNear.round().toString());
  } else {
    value = amount.toString();
  }
  return `${value}${suffix}`;
}

export function convertTimestampToTime(timestamp: string) {
  const timestampBig = new Big(timestamp);

  const hours = timestampBig.div(3600).round(0, 0).toString();
  const minutes = timestampBig.mod(3600).div(60).round(0, 0).toString();
  const seconds = timestampBig.mod(60).round(0, 0).toString();

  return `${hours.padStart(2, '0')}H ${minutes.padStart(
    2,
    '0',
  )}M ${seconds.padStart(2, '0')}S`;
}

export function yoctoToNear(yocto: string, format: boolean) {
  const YOCTO_PER_NEAR = Big(10).pow(24).toString();

  const near = Big(yocto).div(YOCTO_PER_NEAR).toString();

  return format ? localFormat(near) : near;
}

export function fiatValue(big: string, price: string) {
  const value = Big(big).mul(Big(price));
  const stringValue = value.toFixed(6); // Set the desired maximum fraction digits

  const [integerPart, fractionalPart] = stringValue.split('.');

  // Format integer part with commas
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ',',
  );

  // Combine formatted integer and fractional parts
  const formattedNumber = fractionalPart
    ? `${formattedIntegerPart}.${fractionalPart}`
    : formattedIntegerPart;

  return formattedNumber;
}

export function nanoToMilli(nano: string) {
  return Big(nano).div(Big(10).pow(6)).round().toNumber();
}

export function truncateString(str: string, maxLength: number, suffix: string) {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + suffix;
}

export function getConfig(network: string) {
  switch (network) {
    case 'mainnet':
      return {
        nodeUrl: 'https://rpc.mainnet.near.org',
        backendUrl: 'https://api.nearblocks.io/v1/',
        rpcUrl: 'https://beta.rpc.mainnet.near.org',
        appUrl: 'https://nearblocks.io/',
      };
    case 'testnet':
      return {
        nodeUrl: 'https://rpc.testnet.near.org',
        backendUrl: 'https://api-testnet.nearblocks.io/v1/',
        rpcUrl: 'https://archival-rpc.testnet.near.org/',
        appUrl: 'https://testnet.nearblocks.io/',
      };
    default:
      return {};
  }
}

export function debounce<TArgs extends any[]>(
  delay: any,
  func: any,
): Debounce<TArgs> {
  let timer: number | undefined;
  let active = true;
  const debounced: Debounce<TArgs> = (arg) => {
    if (active) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        active && func(arg);
        timer = undefined;
      }, delay);
    } else {
      func(arg);
    }
  };

  debounced.isPending = () => {
    return timer !== undefined;
  };

  debounced.cancel = () => {
    active = false;
  };

  debounced.flush = (arg) => func(arg);

  return debounced;
}

export function timeAgo(unixTimestamp: number): string {
  const currentTimestamp: number = Math.floor(Date.now() / 1000);
  const secondsAgo: number = currentTimestamp - unixTimestamp;

  if (secondsAgo < 5) {
    return 'Just now';
  } else if (secondsAgo < 60) {
    return `${secondsAgo} seconds ago`;
  } else if (secondsAgo < 3600) {
    const minutesAgo: number = Math.floor(secondsAgo / 60);
    return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 86400) {
    const hoursAgo: number = Math.floor(secondsAgo / 3600);
    return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 2592000) {
    const daysAgo: number = Math.floor(secondsAgo / 86400);
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 31536000) {
    const monthsAgo: number = Math.floor(secondsAgo / 2592000);
    return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
  } else {
    const yearsAgo: number = Math.floor(secondsAgo / 31536000);
    return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
  }
}

export function shortenAddress(address: string) {
  const string = String(address);

  if (string.length <= 20) return string;

  return `${string.substr(0, 10)}...${string.substr(-7)}`;
}

export function urlHostName(url: string) {
  try {
    const domain = new URL(url);
    return domain?.hostname ?? null;
  } catch (e) {
    return null;
  }
}

export function holderPercentage(supply: string, quantity: string) {
  return Math.min(Big(quantity).div(Big(supply)).mul(Big(100)).toFixed(2), 100);
}

export function isAction(type: string) {
  const actions = [
    'DEPLOY_CONTRACT',
    'TRANSFER',
    'STAKE',
    'ADD_KEY',
    'DELETE_KEY',
    'DELETE_ACCOUNT',
  ];

  return actions.includes(type.toUpperCase());
}

export function isJson(string: string) {
  const str = string.replace(/\\/g, '');

  try {
    JSON.parse(str);
    return false;
  } catch (e) {
    return false;
  }
}

export function uniqueId() {
  return Math.floor(Math.random() * 1000);
}
export function handleRateLimit(
  data: { status: number },
  reFetch: () => void,
  Loading?: () => void,
) {
  if (data.status === 429 || data.status === undefined) {
    const retryCount = 4;
    const delay = Math.pow(2, retryCount) * 1000;
    setTimeout(() => {
      reFetch();
    }, delay);
  } else {
    if (Loading) {
      Loading();
    }
  }
}

export function mapFeilds(fields: FieldType[]) {
  const args = {};

  fields.forEach((fld) => {
    let value: string | boolean | number | null = fld.value;

    if (fld.type === 'number') {
      value = Number(value);
    } else if (fld.type === 'boolean') {
      value =
        value.trim().length > 0 &&
        !['false', '0'].includes(value.toLowerCase());
    } else if (fld.type === 'json') {
      value = JSON.parse(value);
    } else if (fld.type === 'null') {
      value = null;
    }

    (args as Record<string, FieldValueTypes>)[fld.name] = value + '';
  });

  return args;
}
