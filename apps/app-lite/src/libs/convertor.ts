import Big from 'big.js';

const YOCTO_PER_NEAR = Big(10).pow(24);
const T_GAS = Big(10).pow(12);

export const yoctoToNear = (value: string) =>
  Big(value).div(YOCTO_PER_NEAR).toString();

export const yoctoToTgas = (value: string) =>
  Big(yoctoToNear(value)).mul(T_GAS).toString();

export const nsToDateTime = (value: number | string, format: string) => {
  const date = new Date(Number(value) / 1e6);

  const replacements: Record<string, string> = {
    DD: date.getUTCDate().toString().padStart(2, '0'),
    HH: date.getUTCHours().toString().padStart(2, '0'),
    MM: (date.getUTCMonth() + 1).toString().padStart(2, '0'),
    mm: date.getUTCMinutes().toString().padStart(2, '0'),
    ss: date.getUTCSeconds().toString().padStart(2, '0'),
    YYYY: date.getUTCFullYear().toString(),
  };

  return Object.entries(replacements).reduce(
    (formatted, [token, replacement]) => formatted.replace(token, replacement),
    format,
  );
};
