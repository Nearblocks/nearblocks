import Big from 'big.js';
import get from 'lodash/get';
import { jwtDecode } from 'jwt-decode';
import { FieldType, GuessableTypeString } from '@/utils/types';
import { QueryParams } from '@near-wallet-selector/core/src/lib/services';

const ACCOUNT_ID_REGEX =
  /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;

export const stripEmpty = <T extends Record<string, any>>(obj: T): T =>
  Object.entries(obj).reduce((a, [k, v]) => {
    if (k === 'id') return a;
    if (v != null && v !== '') {
      (a as any)[k] = v;
    }
    return a;
  }, {} as T);

export function shortenAddress(address: string) {
  const string = String(address);

  if (string.length <= 20) return string;

  return `${string.substr(0, 10)}...${string.substr(-7)}`;
}

export function isAction(type: string) {
  const actions = [
    'DEPLOY_CONTRACT',
    'TRANSFER',
    'STAKE',
    'ADD_KEY',
    'DELETE_KEY',
    'DELETE_ACCOUNT',
  ];

  return actions.includes(type.toUpperCase());
}

export function nanoToMilli(nano: string) {
  if (!nano || isNaN(Number(nano))) {
    console.warn(`Invalid number provided: ${nano}`);
    return NaN; // or return a default value like 0
  }

  return new Big(nano).div(new Big(10).pow(6)).round().toNumber();
}

export function dollarNonCentFormat(number: string) {
  const bigNumber = new Big(number).toFixed(0);

  // Extract integer part and format with commas
  const integerPart = bigNumber.toString();
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return formattedInteger;
}

export function yoctoToNear(yocto: string, format: boolean) {
  const YOCTO_PER_NEAR = Big(10).pow(24).toString();

  const near = Big(yocto).div(YOCTO_PER_NEAR).toString();

  return format ? localFormat(near) : near;
}

export function truncateString(str: string, maxLength: number, suffix: string) {
  if (str?.length <= maxLength) {
    return str;
  }
  return str?.substring(0, maxLength) + suffix;
}

export function currency(number: string) {
  let absNumber = new Big(number).abs();

  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q'];
  let suffixIndex = 0;

  while (absNumber.gte(1000) && suffixIndex < suffixes.length - 1) {
    absNumber = absNumber.div(1000); // Divide using big.js's div method
    suffixIndex++;
  }

  const formattedNumber = absNumber.toFixed(2); // Format with 2 decimal places

  return (
    (number < '0' ? '-' : '') + formattedNumber + ' ' + suffixes[suffixIndex]
  );
}

export function fiatValue(big: string, price: string) {
  if (big === '0') {
    return '0';
  }
  const value = Big(big).mul(Big(price));
  const stringValue = value.toFixed(6); // Set the desired maximum fraction digits

  const [integerPart, fractionalPart] = stringValue.split('.');

  // Format integer part with commas
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ',',
  );

  // Combine formatted integer and fractional parts
  const formattedNumber = fractionalPart
    ? `${formattedIntegerPart}.${fractionalPart}`
    : formattedIntegerPart;

  return formattedNumber;
}

export function dollarFormat(number: number) {
  if (isNaN(number)) {
    return 'N/A'; // Return 'N/A' if the number is not valid
  }

  const bigNumber = new Big(number);

  // Format to two decimal places without thousands separator
  const formattedNumber = bigNumber.toFixed(2);

  // Add comma as a thousands separator
  const parts = formattedNumber.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const dollarFormattedNumber = `${parts.join('.')}`;

  return dollarFormattedNumber;
}

export function formatCustomDate(inputDate: string) {
  var date = new Date(inputDate);

  // Array of month names
  var monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Get month and day
  var month = monthNames[date.getMonth()];
  var day = date.getDate();

  // Create formatted date string in "MMM DD" format
  var formattedDate = month + ' ' + (day < 10 ? '0' + day : day);

  return formattedDate;
}

export function localFormat(number: string) {
  const bigNumber = number && new Big(number); // Instantiate Big correctly
  const formattedNumber =
    bigNumber && bigNumber.toFixed(6).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); // Add commas before the decimal point

  return formattedNumber && formattedNumber.replace(/\.?0*$/, ''); // Remove trailing zeros and the dot
}

export function priceFormat(number: string) {
  const bigNumber = Big(number);
  const formattedNumber = bigNumber
    .toFixed(8)
    .replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); // Add commas before the decimal point
  return formattedNumber.replace(/\.?0*$/, ''); // Remove trailing zeros and the dot
}

export function convertToMetricPrefix(numberStr: string) {
  const prefixes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']; // Metric prefixes

  let result = new Big(numberStr);
  let count = 0;

  while (result.abs().gte('1e3') && count < prefixes.length - 1) {
    result = result.div(1e3);
    count++;
  }
  let formattedResult;
  // Check if the value is an integer or has more than two digits before the decimal point
  if (result.abs().lt(1e2) && result.toFixed(2) !== result.toFixed(0)) {
    formattedResult = result.toFixed(2);
  } else {
    formattedResult = result.toFixed(0);
  }

  return formattedResult.toString() + ' ' + prefixes[count];
}

export function gasFee(gas: string, price: string) {
  const near = yoctoToNear(Big(gas).mul(Big(price)).toString(), true);

  return `${near}`;
}
export function formatNumber(value: string) {
  let bigValue = new Big(value);
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let suffixIndex = 0;

  while (bigValue.gte(10000) && suffixIndex < suffixes.length - 1) {
    bigValue = bigValue.div(1000);
    suffixIndex++;
  }

  const formattedValue = bigValue.toFixed(1).replace(/\.0+$/, '');
  return `${formattedValue} ${suffixes[suffixIndex]}`;
}
export function getTimeAgoString(timestamp: number) {
  const currentUTC = Date.now();
  const date = new Date(timestamp);
  const seconds = Math.floor((currentUTC - date.getTime()) / 1000);

  const intervals = {
    day: seconds / (60 * 60 * 24),
    hour: seconds / (60 * 60),
    minute: seconds / 60,
    month: seconds / (60 * 60 * 24 * 30),
    week: seconds / (60 * 60 * 24 * 7),
    year: seconds / (60 * 60 * 24 * 365),
  };

  if (intervals.year >= 1) {
    return (
      Math.floor(intervals.year) +
      ' year' +
      (Math.floor(intervals.year) > 1 ? 's' : '') +
      ' ago'
    );
  } else if (intervals.month >= 1) {
    return (
      Math.floor(intervals.month) +
      ' month' +
      (Math.floor(intervals.month) > 1 ? 's' : '') +
      ' ago'
    );
  } else if (intervals.day >= 1) {
    return (
      Math.floor(intervals.day) +
      ' day' +
      (Math.floor(intervals.day) > 1 ? 's' : '') +
      ' ago'
    );
  } else if (intervals.hour >= 1) {
    return (
      Math.floor(intervals.hour) +
      ' hour' +
      (Math.floor(intervals.hour) > 1 ? 's' : '') +
      ' ago'
    );
  } else if (intervals.minute >= 1) {
    return (
      Math.floor(intervals.minute) +
      ' minute' +
      (Math.floor(intervals.minute) > 1 ? 's' : '') +
      ' ago'
    );
  } else {
    return 'a few seconds ago';
  }
}
export function formatWithCommas(number: string) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
export function formatTimestampToString(timestamp: number) {
  const date = new Date(timestamp);

  // Format the date to 'YYYY-MM-DD HH:mm:ss' format
  const formattedDate = date.toISOString().replace('T', ' ').split('.')[0];

  return formattedDate;
}

export function convertToUTC(timestamp: number, hour: boolean) {
  const date = new Date(timestamp);

  // Get UTC date components
  const utcYear = date.getUTCFullYear();
  const utcMonth = ('0' + (date.getUTCMonth() + 1)).slice(-2); // Adding 1 because months are zero-based
  const utcDay = ('0' + date.getUTCDate()).slice(-2);
  const utcHours = ('0' + date.getUTCHours()).slice(-2);
  const utcMinutes = ('0' + date.getUTCMinutes()).slice(-2);
  const utcSeconds = ('0' + date.getUTCSeconds()).slice(-2);

  // Array of month abbreviations
  const monthAbbreviations = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const monthIndex = Number(utcMonth) - 1;
  // Format the date as required (Jul-25-2022 16:25:37)
  let formattedDate =
    monthAbbreviations[monthIndex] +
    '-' +
    utcDay +
    '-' +
    utcYear +
    ' ' +
    utcHours +
    ':' +
    utcMinutes +
    ':' +
    utcSeconds;

  if (hour) {
    // Convert hours to 12-hour format
    let hour12 = parseInt(utcHours);
    const ampm = hour12 >= 12 ? 'PM' : 'AM';
    hour12 = hour12 % 12 || 12;

    // Add AM/PM to the formatted date (Jul-25-2022 4:25:37 PM)
    formattedDate =
      monthAbbreviations[monthIndex] +
      '-' +
      utcDay +
      '-' +
      utcYear +
      ' ' +
      hour12 +
      ':' +
      utcMinutes +
      ':' +
      utcSeconds +
      ' ' +
      ampm;
  }

  return formattedDate;
}

export function weight(number: string) {
  let sizeInBytes = new Big(number);

  if (sizeInBytes.lt(0)) {
    throw new Error('Invalid input. Please provide a non-negative number.');
  }

  const suffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let suffixIndex = 0;

  while (sizeInBytes.gte(1000) && suffixIndex < suffixes.length - 1) {
    sizeInBytes = sizeInBytes.div(1000); // Assign the result back to sizeInBytes
    suffixIndex++;
  }

  const formattedSize = sizeInBytes.toFixed(2) + ' ' + suffixes[suffixIndex];

  return formattedSize;
}

export function capitalizeWords(str: string) {
  const words: string[] = str.split('_');
  const capitalizedWords: string[] = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );
  const result: string = capitalizedWords.join(' ');
  return result;
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toSnakeCase(str: string) {
  return str
    .replace(/[A-Z]/g, (match) => '_' + match.toLowerCase())
    .replace(/^_/, '');
}

export function serialNumber(index: number, page: number, perPage: number) {
  return index + 1 + (page - 1) * perPage;
}

export function shortenToken(token: string) {
  return truncateString(token, 14, '');
}

export function shortenTokenSymbol(token: string) {
  return truncateString(token, 5, '');
}

export function gasPercentage(gasUsed: string, gasAttached: string) {
  if (!gasAttached) return 'N/A';
  // @ts-ignore
  const formattedNumber = (Big(gasUsed).div(Big(gasAttached)) * 100).toFixed(2);
  return `${formattedNumber}%`;
}

export function shortenHex(address: string) {
  return `${address && address.substr(0, 6)}...${address.substr(-4)}`;
}
export function formatDate(dateString: string) {
  const inputDate = new Date(dateString);

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayOfWeek = days[inputDate.getDay()];
  const month = months[inputDate.getMonth()];
  const day = inputDate.getDate();
  const year = inputDate.getFullYear();

  const formattedDate = dayOfWeek + ', ' + month + ' ' + day + ', ' + year;
  return formattedDate;
}

export const isJson = (string: string) => {
  const str = string.replace(/\\/g, '');

  try {
    JSON.parse(str);
    return false;
  } catch (e) {
    return false;
  }
};

const strToType = (str: string, type: GuessableTypeString): unknown => {
  switch (type) {
    case 'json':
      return JSON.parse(str);
    case 'number':
      return Number(str);
    case 'boolean':
      return (
        str.trim().length > 0 && !['0', 'false'].includes(str.toLowerCase())
      );
    case 'null':
      return null;
    default:
      return str + '';
  }
};

export const mapFeilds = (fields: FieldType[]) => {
  const args: any = {};

  fields.forEach((fld: FieldType) => {
    args[fld.name] = strToType(fld.value, fld.type as GuessableTypeString);
  });

  return args;
};

export function urlHostName(url: string) {
  try {
    const domain = new URL(url);
    return domain?.hostname ?? null;
  } catch (e) {
    return null;
  }
}

export function holderPercentage(supply: string, quantity: string) {
  const percentage = Big(quantity).div(Big(supply)).mul(Big(100));
  return percentage.gt(100) ? '100.00' : percentage.toFixed(2);
}

export const catchErrors = (error: any) => {
  try {
    const errors = get(error, 'response.data.errors') || {};
    const common = get(error, 'response.data.message') || null;
    let message;

    if (errors?.message) {
      message = errors.message;
    } else {
      Object.keys(errors).forEach((key) => {
        message = get(errors, `${key}.message`) || '';
      });
    }
    return message || common || error.message;
  } catch (e) {
    return 'Something went wrong, try again later';
  }
};

export const removeProtocol = (url?: string) => {
  // Remove http:// or https:// from the beginning of the URL
  return url?.replace(/^https?:\/\//, '');
};

export const centsToDollar = (val: number) => {
  const value = (val / 100).toFixed(2);
  return value;
};

export const isValidAccount = (accountId: string) => {
  return (
    accountId.length >= 2 &&
    accountId.length <= 64 &&
    ACCOUNT_ID_REGEX.test(accountId)
  );
};

export function getFilteredQueryParams(
  query: QueryParams,
  requiredKeys: string[],
) {
  const filteredParams = Object.fromEntries(
    Object.entries(query).filter(([key]) => requiredKeys.includes(key)),
  );
  return Object.keys(filteredParams).length ? filteredParams : {};
}

export const getUserDataFromToken = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Invalid token or decoding failed', error);
    return null;
  }
};

export function isValidJson(value: string): boolean {
  try {
    const parsed = JSON.parse(value);

    return parsed && typeof parsed === 'object';
  } catch (e) {
    return false;
  }
}
