import Big, { BigSource } from 'big.js';

export type NumberFormat = bigint | null | number | string | undefined;

export const currencyFormat = (
  value: NumberFormat,
  options?: Intl.NumberFormatOptions,
) => {
  if (value === undefined || value === null) return '';

  const data =
    typeof value === 'string' ? (value as Intl.StringNumericLiteral) : value;

  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    currencyDisplay: 'symbol',
    style: 'currency',
    ...options,
  }).format(data);
};

export const numberFormat = (
  value: NumberFormat,
  options?: Intl.NumberFormatOptions,
) => {
  if (value === undefined || value === null) return '';

  const data =
    typeof value === 'string' ? (value as Intl.StringNumericLiteral) : value;

  return new Intl.NumberFormat('en-US', options).format(data);
};

export const nearFormat = (
  yoctoNear: BigSource | null | undefined,
  options?: Intl.NumberFormatOptions,
) => {
  if (yoctoNear === undefined || yoctoNear === null) return '';

  return numberFormat(toNear(yoctoNear), {
    maximumFractionDigits: 6,
    ...options,
  });
};

export const nearFiatFormat = (
  yoctoNear: BigSource | null | undefined,
  nearPrice: BigSource | null | undefined,
  options?: Intl.NumberFormatOptions,
) => {
  if (
    yoctoNear === undefined ||
    yoctoNear === null ||
    nearPrice === undefined ||
    nearPrice === null
  )
    return '';

  return currencyFormat(toNearFiat(yoctoNear, nearPrice), options);
};

export const gasFormat = (
  yoctoNear: BigSource | null | undefined,
  options?: Intl.NumberFormatOptions,
) => {
  if (yoctoNear === undefined || yoctoNear === null) return '';

  return numberFormat(
    Big(yoctoNear)
      .div(Big(10 ** 12))
      .toString(),
    options,
  );
};

export const dateFormat = (
  locale: string,
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
) => {
  return new Intl.DateTimeFormat(locale, options).format(
    typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date,
  );
};

export const bytesFormat = (
  bytes: NumberFormat,
  options?: Intl.NumberFormatOptions,
) => {
  if (bytes === undefined || bytes === null) return '';

  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'];
  let value = Number(bytes);
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return numberFormat(value, {
    maximumFractionDigits: 2,
    style: 'unit',
    unit: units[unitIndex],
    unitDisplay: 'short',
    ...options,
  });
};

export const toNear = (yoctoNear: BigSource) => {
  return new Big(yoctoNear).div(Big(10 ** 24)).toString();
};

export const toNearFiat = (yoctoNear: BigSource, nearPrice: BigSource) => {
  return new Big(toNear(yoctoNear)).mul(nearPrice).toString();
};

export const toTokenAmount = (value: BigSource, decimal: number) => {
  if (decimal === 0) return new Big(value).toString();
  return new Big(value).div(Big(10 ** decimal)).toString();
};

export const toTokenPrice = (
  value: BigSource,
  decimal: number,
  price: BigSource,
) => {
  return new Big(toTokenAmount(value, decimal)).mul(price).toString();
};

export const toMs = (ns: BigSource) => +ns / 10 ** 6;
