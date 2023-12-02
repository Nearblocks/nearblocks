import { localFormat, formatWithCommas } from '@/includes/formats';

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
  // @ts-ignore
  const value = Big(big).mul(Big(price)).toString();
  const formattedNumber = Number(value).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formattedNumber;
}

export function nanoToMilli(nano: number) {
  return Big(nano).div(Big(10).pow(6)).round().toNumber();
}

export function shortenAddress(address: string) {
  const string = String(address);

  if (string.length <= 20) return string;

  return `${string.substr(0, 10)}...${string.substr(-7)}`;
}

export function truncateString(str: string, maxLength: number, suffix: string) {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - suffix.length) + suffix;
}

export function getConfig(network: string) {
  switch (network) {
    case 'mainnet':
      return {
        ownerId: 'nearblocks.near',
        nodeUrl: 'https://rpc.mainnet.near.org',
        backendUrl: 'https://api-beta.nearblocks.io/v1/',
        rpcUrl: 'https://archival-rpc.testnet.near.org',
        appUrl: 'https://nearblocks.io/',
      };
    case 'testnet':
      return {
        ownerId: 'nearblocks.testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        backendUrl: 'https://api-testnet-beta.nearblocks.io/v1/',
        rpcUrl: 'https://archival-rpc.testnet.near.org',
        appUrl: 'https://testnet.nearblocks.io/',
      };
    default:
      return {};
  }
}
