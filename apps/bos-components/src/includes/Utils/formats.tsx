export default function () {
  function yoctoToNear(yocto: string, format: boolean) {
    const YOCTO_PER_NEAR = Big(10).pow(24).toString();

    const near = Big(yocto).div(YOCTO_PER_NEAR).toString();

    return format ? localFormat(near) : near;
  }
  function truncateString(str: string, maxLength: number, suffix: string) {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength) + suffix;
  }
  function currency(number: string) {
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

  function dollarFormat(number: string) {
    const bigNumber = new Big(number);

    // Format to two decimal places without thousands separator
    const formattedNumber = bigNumber.toFixed(2);

    // Add comma as a thousands separator
    const parts = formattedNumber.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const dollarFormattedNumber = `${parts.join('.')}`;

    return dollarFormattedNumber;
  }

  function formatCustomDate(inputDate: string) {
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

  function localFormat(number: string) {
    const bigNumber = Big(number);
    const formattedNumber = bigNumber
      .toFixed(5)
      .replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); // Add commas before the decimal point
    return formattedNumber.replace(/\.?0*$/, ''); // Remove trailing zeros and the dot
  }

  function priceFormat(number: string) {
    const bigNumber = Big(number);
    const formattedNumber = bigNumber
      .toFixed(8)
      .replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); // Add commas before the decimal point
    return formattedNumber.replace(/\.?0*$/, ''); // Remove trailing zeros and the dot
  }

  function convertToMetricPrefix(numberStr: string) {
    const prefixes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']; // Metric prefixes

    let result = new Big(numberStr);
    let count = 0;

    while (result.abs().gte('1e3') && count < prefixes.length - 1) {
      result = result.div(1e3);
      count++;
    }

    // Check if the value is an integer or has more than two digits before the decimal point
    if (result.abs().lt(1e2) && result.toFixed(2) !== result.toFixed(0)) {
      result = result.toFixed(2);
    } else {
      result = result.toFixed(0);
    }

    return result.toString() + ' ' + prefixes[count];
  }

  function gasFee(gas: string, price: string) {
    const near = yoctoToNear(Big(gas).mul(Big(price)).toString(), true);

    return `${near}`;
  }
  function formatNumber(value: string) {
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
  function getTimeAgoString(timestamp: string) {
    const currentUTC = Date.now();
    const date = new Date(timestamp);
    const seconds = Math.floor((currentUTC - date.getTime()) / 1000);

    const intervals = {
      year: seconds / (60 * 60 * 24 * 365),
      month: seconds / (60 * 60 * 24 * 30),
      week: seconds / (60 * 60 * 24 * 7),
      day: seconds / (60 * 60 * 24),
      hour: seconds / (60 * 60),
      minute: seconds / 60,
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
  function formatWithCommas(number: string) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function formatTimestampToString(timestamp: string) {
    const date = new Date(timestamp);

    // Format the date to 'YYYY-MM-DD HH:mm:ss' format
    const formattedDate = date.toISOString().replace('T', ' ').split('.')[0];

    return formattedDate;
  }

  function convertToUTC(timestamp: string, hour: boolean) {
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

  function weight(number: string) {
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

  function capitalizeWords(str: string) {
    const words: string[] = str.split('_');
    const capitalizedWords: string[] = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1),
    );
    const result: string = capitalizedWords.join(' ');
    return result;
  }

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function toSnakeCase(str: string) {
    return str
      .replace(/[A-Z]/g, (match) => '_' + match.toLowerCase())
      .replace(/^_/, '');
  }

  function dollarNonCentFormat(number: string) {
    const bigNumber = new Big(number).toFixed(0);

    // Extract integer part and format with commas
    const integerPart = bigNumber.toString();
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return formattedInteger;
  }

  function serialNumber(index: number, page: number, perPage: number) {
    return index + 1 + (page - 1) * perPage;
  }

  function shortenToken(token: string) {
    return truncateString(token, 14, '');
  }

  function shortenTokenSymbol(token: string) {
    return truncateString(token, 5, '');
  }

  function gasPercentage(gasUsed: string, gasAttached: string) {
    if (!gasAttached) return 'N/A';

    const formattedNumber = (Big(gasUsed).div(Big(gasAttached)) * 100).toFixed(
      2,
    );
    return `${formattedNumber}%`;
  }

  function shortenHex(address: string) {
    return `${address && address.substr(0, 6)}...${address.substr(-4)}`;
  }
  function formatDate(dateString: string) {
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
  return {
    currency,
    dollarFormat,
    formatCustomDate,
    localFormat,
    convertToMetricPrefix,
    gasFee,
    getTimeAgoString,
    formatWithCommas,
    formatTimestampToString,
    convertToUTC,
    weight,
    capitalizeWords,
    capitalizeFirstLetter,
    capitalize,
    toSnakeCase,
    dollarNonCentFormat,
    serialNumber,
    shortenToken,
    shortenTokenSymbol,
    gasPercentage,
    shortenHex,
    formatNumber,
    formatDate,
    priceFormat,
  };
}
