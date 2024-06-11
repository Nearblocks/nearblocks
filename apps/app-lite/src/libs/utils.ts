import Big from 'big.js';

const YOCTO_PER_NEAR = Big(10).pow(24);
const ACCOUNT_ID_REGEX =
  /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;

export const isValidAccount = (accountId: string) => {
  return (
    accountId.length >= 2 &&
    accountId.length <= 64 &&
    ACCOUNT_ID_REGEX.test(accountId)
  );
};

export const numberFormat = (value: string, decimals = 0) => {
  const parts = value.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (parts.length === 1 || decimals === 0) return integerPart;

  const decimalPart = parts[1].slice(0, decimals).replace(/0+$/, '');

  if (!decimalPart) return integerPart;

  return `${integerPart}.${decimalPart}`;
};

export const yoctoToNear = (yocto: string) =>
  Big(yocto).div(YOCTO_PER_NEAR).toString();

export const shortenHash = (hash: string) =>
  `${hash && hash.slice(0, 6)}...${hash.slice(-4)}`;

export const shortenAddress = (address: string) => {
  const string = String(address);

  if (string.length <= 20) return string;

  return `${string.slice(0, 10)}...${string.slice(-7)}`;
};
