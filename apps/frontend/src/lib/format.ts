import Big, { BigSource } from 'big.js';

export type NumberFormat = bigint | null | number | string | undefined;

export const currencyFormat = (
  number: NumberFormat,
  options?: Intl.NumberFormatOptions,
) => {
  if (number === undefined || number === null) return '';

  const value =
    typeof number === 'string' ? (number as Intl.StringNumericLiteral) : number;

  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    currencyDisplay: 'symbol',
    style: 'currency',
    ...options,
  }).format(value);
};

export const numberFormat = (
  number: NumberFormat,
  options?: Intl.NumberFormatOptions,
) => {
  if (number === undefined || number === null) return '';

  const value =
    typeof number === 'string' ? (number as Intl.StringNumericLiteral) : number;

  return new Intl.NumberFormat('en-US', options).format(value);
};

export const nearFormat = (
  yoctoNear: BigSource | null | undefined,
  options?: Intl.NumberFormatOptions,
) => {
  if (yoctoNear === undefined || yoctoNear === null) return '';

  return numberFormat(
    new Big(yoctoNear).div(Big(10 ** 24)).toString(),
    options,
  );
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
