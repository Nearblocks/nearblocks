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

export const shortenString = (
  string: string,
  prefixLen?: number,
  suffixLen?: number,
  minLen?: number,
) => {
  const text = String(string);
  const prefix = prefixLen ?? 6;
  const suffix = suffixLen ?? 7;
  const threshold = minLen ?? 15;
  if (text.length <= threshold) return text;
  return `${text.slice(0, prefix)}...${text.slice(-suffix)}`;
};

export const nsToDateTime = (value: number | string, format: string) => {
  const date = new Date(Number(value) / 1e6);

  const year = date.getUTCFullYear().toString();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hour = date.getUTCHours().toString().padStart(2, '0');
  const minute = date.getUTCMinutes().toString().padStart(2, '0');
  const second = date.getUTCSeconds().toString().padStart(2, '0');

  const replacements: { [key: string]: string } = {
    DD: day,
    HH: hour,
    mm: minute,
    MM: month,
    ss: second,
    YYYY: year,
  };

  let formatted = format;

  for (const [token, value] of Object.entries(replacements)) {
    formatted = formatted.replace(token, value);
  }

  return formatted;
};

export const depositAmount = (actions: any) => {
  return actions
    .map((action: any) => {
      if (typeof action === 'string') return '0';
      if ('FunctionCall' in action) return action.FunctionCall.deposit;
      if ('Transfer' in action) return action.Transfer.deposit;
      return '0';
    })
    .reduce((acc: any, deposit: any) => Big(acc).plus(deposit).toString(), '0');
};

export const txnFee = (receiptsOutcome: any, txnTokensBurnt: any) => {
  return receiptsOutcome
    .map((receipt: any) => receipt.outcome.tokens_burnt)
    .reduce(
      (acc: any, fee: any) => Big(acc).add(fee).toString(),
      txnTokensBurnt,
    );
};

export const gasLimit = (actions: any) => {
  const gasAttached = actions
    .map((action: any) => action.args)
    .filter((args: any) => 'gas' in args);
  if (gasAttached.length === 0) return '0';
  return gasAttached.reduce(
    (acc: any, args: any) => Big(acc).add(args.gas).toString(),
    '0',
  );
};

export const refund = (receipts: any) => {
  return receipts
    .filter(
      (nestedReceipt: any) =>
        'outcome' in nestedReceipt && nestedReceipt.predecessorId === 'system',
    )
    .reduce((acc: any, nestedReceipt: any) => {
      let gasDeposit = '0';
      if ('outcome' in nestedReceipt) {
        gasDeposit = nestedReceipt.actions
          .map((action: any) =>
            'deposit' in action.args ? action.args.deposit : '0',
          )
          .reduce(
            (acc: any, deposit: any) => Big(acc).add(deposit).toString(),
            '0',
          );
      }
      return Big(acc).add(gasDeposit).toString();
    }, '0');
};

export const jsonStringify = (value: any, replacer: any, space: any) => {
  try {
    return JSON.stringify(value, replacer, space);
  } catch (e) {
    console.error('Error stringifying JSON', e);
    return null;
  }
};

export const jsonParser = (jsonString: any) => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Error parsing JSON', e);
    return null;
  }
};

export const prettify = (args: string): string => {
  try {
    return JSON.stringify(JSON.parse(atob(args)), undefined, 2);
  } catch (error) {
    return args;
  }
};
