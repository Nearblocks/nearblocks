import { localFormat, formatWithCommas } from '@/includes/formats';
import { Debounce } from './types';

export function convertAmountToReadableString(amount: number, type: string) {
  if (!amount) return null;

  let value;
  let suffix;

  const nearNomination = Math.pow(10, 24);

  const amountInNear = Number(amount) / nearNomination;

  if (type === 'totalSupply' || type === 'totalStakeAmount') {
    value = formatWithCommas((amountInNear / 1e6).toFixed(1));
    suffix = 'M';
  } else if (type === 'seatPriceAmount') {
    value = formatWithCommas(Math.round(amountInNear).toString());
  } else {
    value = amount.toString();
  }
  return `${value}${suffix}`;
}

export function convertTimestampToTime(timestamp: number) {
  const hours = Math.floor(timestamp / 3600);
  const minutes = Math.floor((timestamp % 3600) / 60);
  const seconds = Math.floor(timestamp % 60);

  return `${hours.toString().padStart(2, '0')}H ${minutes
    .toString()
    .padStart(2, '0')}M ${seconds.toString().padStart(2, '0')}S`;
}

export function yoctoToNear(yocto: number, format: boolean) {
  const YOCTO_PER_NEAR = Big(10).pow(24).toString();

  const near = Big(yocto).div(YOCTO_PER_NEAR).toString();

  return format ? localFormat(near) : near;
}

export function fiatValue(big: number, price: number) {
  const value = Big(big).mul(Big(price)).toString();
  const formattedNumber = Number(value).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
  return formattedNumber;
}

export function nanoToMilli(nano: number) {
  return new Big(nano).div(new Big(10).pow(6)).round().toNumber();
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
        ownerId: 'nearblocks.near',
        nodeUrl: 'https://rpc.mainnet.near.org',
        backendUrl: 'https://api3.nearblocks.io/v1/',
        rpcUrl: 'https://archival-rpc.testnet.near.org',
        appUrl: 'https://nearblocks.io/',
      };
    case 'testnet':
      return {
        ownerId: 'nearblocks.testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        backendUrl: 'https://api3-testnet.nearblocks.io/v1/',
        rpcUrl: 'https://archival-rpc.testnet.near.org',
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
  } else {
    const daysAgo: number = Math.floor(secondsAgo / 86400);
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
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

export function holderPercentage(supply: number, quantity: number) {
  return Math.min(Big(quantity).div(Big(supply)).mul(Big(100)).toFixed(2), 100);
}
