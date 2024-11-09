import Big from 'big.js';

import { FieldType, GuessableTypeString } from './types';

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

  if (string?.length <= 20) return string;

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
  return new Big(nano).div(new Big(10).pow(6)).round().toNumber();
}

export function dollarNonCentFormat(number: string) {
  const bigNumber = new Big(number).toFixed(0);

  // Extract integer part and format with commas
  const integerPart = bigNumber?.toString();
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return formattedInteger;
}

export function yoctoToNear(yocto: string, format: boolean) {
  const YOCTO_PER_NEAR = Big(10).pow(24)?.toString();

  const near = Big(yocto)?.div(YOCTO_PER_NEAR)?.toString();

  return format ? localFormat(near) : near;
}

export function truncateString(str: string, maxLength: number, suffix: string) {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + suffix;
}

export function currency(number: string) {
  let absNumber = new Big(number).abs();

  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q'];
  let suffixIndex = 0;

  while (absNumber.gte(1000) && suffixIndex < suffixes?.length - 1) {
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

  const [integerPart, fractionalPart] = stringValue && stringValue?.split('.');

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

export function dollarFormat(number: string) {
  const bigNumber = new Big(number);

  // Format to two decimal places without thousands separator
  const formattedNumber = bigNumber.toFixed(2);

  // Add comma as a thousands separator
  const parts = formattedNumber && formattedNumber?.split('.');
  if (parts) parts[0] = parts && parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const dollarFormattedNumber = parts && `${parts.join('.')}`;

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
  const bigNumber = Big(number);
  const formattedNumber = bigNumber
    .toFixed(5)
    .replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); // Add commas before the decimal point
  return formattedNumber.replace(/\.?0*$/, ''); // Remove trailing zeros and the dot
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

  while (result.abs().gte('1e3') && count < prefixes?.length - 1) {
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

  return formattedResult?.toString() + ' ' + prefixes[count];
}

export function gasFee(gas: string, price: string) {
  const near = yoctoToNear(Big(gas).mul(Big(price))?.toString(), true);

  return `${near}`;
}
export function formatNumber(value: string) {
  let bigValue = new Big(value);
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let suffixIndex = 0;

  while (bigValue.gte(10000) && suffixIndex < suffixes?.length - 1) {
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
  return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
export function formatTimestampToString(timestamp: number) {
  const date = new Date(timestamp);

  // Format the date to 'YYYY-MM-DD HH:mm:ss' format
  const formattedDate =
    date && date?.toISOString()?.replace('T', ' ')?.split('.')[0];

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

  while (sizeInBytes.gte(1000) && suffixIndex < suffixes?.length - 1) {
    sizeInBytes = sizeInBytes.div(1000); // Assign the result back to sizeInBytes
    suffixIndex++;
  }

  const formattedSize = sizeInBytes.toFixed(2) + ' ' + suffixes[suffixIndex];

  return formattedSize;
}

export function capitalizeWords(str: string) {
  const words: any | string[] = str && str.split('_');
  const capitalizedWords: string[] =
    words &&
    words.map((word: any) => word.charAt(0).toUpperCase() + word.slice(1));
  const result: string = capitalizedWords.join(' ');
  return result;
}

export function capitalizeFirstLetter(string: string) {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
}

export function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export function toSnakeCase(str: string) {
  return (
    str &&
    str
      .replace(/[A-Z]/g, (match) => '_' + match.toLowerCase())
      .replace(/^_/, '')
  );
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
  const str = string && string.replace(/\\/g, '');

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
        str.trim()?.length > 0 && !['0', 'false'].includes(str.toLowerCase())
      );
    case 'null':
      return null;
    default:
      return str + '';
  }
};

export const mapFeilds = (fields: FieldType[]) => {
  const args: any = {};

  fields &&
    fields.forEach((fld: FieldType) => {
      args[fld?.name] = strToType(fld?.value, fld?.type as GuessableTypeString);
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

  return percentage.gt(100)
    ? '100'
    : percentage.toFixed(2) === '0.00'
    ? '0'
    : percentage.toFixed(2);
}

export function tokenAmount(
  amount: string,
  decimal: string,
  format: boolean,
): string {
  if (amount === undefined || amount === null) return 'N/A';

  const decimalNumber = Number(decimal);
  if (isNaN(decimalNumber)) throw new Error('Invalid decimal value');

  const near = Big(amount).div(Big(10).pow(decimalNumber));

  const formattedValue = format
    ? near.toFixed(8).replace(/\.?0+$/, '')
    : near.toFixed(decimalNumber).replace(/\.?0+$/, '');

  return formattedValue;
}

export function timeAgo(unixTimestamp: number): string {
  const currentTimestamp: number = Math.floor(Date.now() / 1000);
  const secondsAgo: number = currentTimestamp - unixTimestamp;

  if (secondsAgo < 5) {
    return 'Just now';
  } else if (secondsAgo < 60) {
    return `${secondsAgo} seconds ago`;
  } else if (secondsAgo < 3600) {
    const minutesAgo: number = Math.floor(secondsAgo / 60);
    return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 86400) {
    const hoursAgo: number = Math.floor(secondsAgo / 3600);
    return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 2592000) {
    const daysAgo: number = Math.floor(secondsAgo / 86400);
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 31536000) {
    const monthsAgo: number = Math.floor(secondsAgo / 2592000);
    return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
  } else {
    const yearsAgo: number = Math.floor(secondsAgo / 31536000);
    return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
  }
}

export function convertTimestampToTime(timestamp: string) {
  const timestampBig = new Big(timestamp);

  const hours = timestampBig?.div(3600)?.round(0, 0)?.toString();
  const minutes = timestampBig?.mod(3600)?.div(60)?.round(0, 0)?.toString();
  const seconds = timestampBig?.mod(60)?.round(0, 0)?.toString();

  return `${hours?.padStart(2, '0')}H ${minutes?.padStart(
    2,
    '0',
  )}M ${seconds?.padStart(2, '0')}S`;
}

export function convertAmountToReadableString(amount: string, type: string) {
  if (!amount) return null;

  let value = '';
  let suffix = '';

  const nearNomination = new Big(10).pow(24);

  const amountInNear = new Big(amount).div(nearNomination);

  if (type === 'totalSupply' || type === 'totalStakeAmount') {
    value = formatWithCommas(amountInNear?.div(1e6)?.toFixed(1));
    suffix = 'M';
  } else if (type === 'seatPriceAmount') {
    value = formatWithCommas(amountInNear?.round()?.toString());
  } else {
    value = amount?.toString();
  }
  return `${value}${suffix}`;
}

export function jsonParser(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Error parsing JSON', e);
    return null;
  }
}
export function jsonStringify(obj: any, replacer?: any, space?: any) {
  try {
    return JSON.stringify(obj, replacer, space);
  } catch (e) {
    console.error('Error stringifying JSON', e);
    return null;
  }
}

export const getCookieFromRequest = (
  cookieName: string,
  req: any,
): null | string => {
  const cookies = req.headers.cookie || '';
  const cookie = cookies
    .split('; ')
    .find((row: any) => row.startsWith(`${cookieName}=`));

  return cookie ? cookie.split('=')[1] : null;
};

export const parseGitHubLink = (snapshot: string) => {
  const regex =
    /^(?:git\+https:\/\/github\.com\/([^\/]+\/[^\/]+)(?:\.git)?\?rev=([a-f0-9]+)|https:\/\/github\.com\/([^\/]+\/[^\/]+)(?:\.git)?(?:\/tree\/([a-f0-9]+))?)$/;

  const match = snapshot.match(regex);

  const commitHash = match ? match[2] || match[4] : '';

  const url = snapshot.substring(snapshot.indexOf('http'));

  if (match && commitHash) return { text: commitHash, url };

  if (url) return { text: snapshot, url };

  return null;
};

export const parseLink = (link: string) => {
  try {
    const url = new URL(link);

    return {
      text: `${url.hostname}${url.pathname}`,
      url: link,
    };
  } catch {
    return null;
  }
};
