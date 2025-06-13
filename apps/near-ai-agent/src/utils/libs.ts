import Big from 'big.js';
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
  return `${address && address?.substr(0, 6)}...${address?.substr(-4)}`;
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
