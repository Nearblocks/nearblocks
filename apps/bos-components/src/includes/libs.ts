import { localFormat } from '@/includes/formats';

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
