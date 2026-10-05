import Big from 'big.js';

export const formatNumber = (value: string, decimals: number) => {
  const parts = Big(value).toFixed(decimals).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (parts.length === 1 || decimals === 0) return integerPart;

  const decimalPart = parts[1].slice(0, decimals).replace(/0+$/, '');

  if (!decimalPart) return integerPart;

  return `${integerPart}.${decimalPart}`;
};

export const formatSize = (value: string, decimals: number) => {
  const bigNumber = Big(value);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  if (bigNumber.eq(0)) return '0 B';

  const i = Math.floor(Math.log(bigNumber.toNumber()) / Math.log(1024));
  const converted = bigNumber.div(Big(1024).pow(i)).toString();

  return `${formatNumber(converted, decimals)} ${sizes[i]}`;
};
