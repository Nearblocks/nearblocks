export default function () {
  function localFormat(number: string) {
    const bigNumber = Big(number);
    const formattedNumber = bigNumber
      .toFixed(5)
      .replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); // Add commas before the decimal point
    return formattedNumber.replace(/\.?0*$/, ''); // Remove trailing zeros and the dot
  }

  return { localFormat };
}
