import type * as big from 'big.js';

type FormatNumber = (value: string, decimals: number) => string;
type FormatScale = (value: string, decimals: number) => string;
type FormatSize = (value: string, decimals: number) => string;
type YoctoToNear = (value: string) => string;
type ShortenHash = (value: string) => string;
type ShortenAddress = (value: string) => string;
type IsValidAccount = (value: string) => boolean;

export type FormatterModule = {
  formatNumber: FormatNumber;
  formatScale: FormatScale;
  formatSize: FormatSize;
  isValidAccount: IsValidAccount;
  shortenAddress: ShortenAddress;
  shortenHash: ShortenHash;
  yoctoToNear: YoctoToNear;
};
const YOCTO_PER_NEAR = Big(10).pow(24);
const ACCOUNT_ID_REGEX =
  /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;

const formatter = (): FormatterModule => {
  const formatNumber: FormatNumber = (value, decimals) => {
    const bigNumber = Big(value).toFixed(decimals);
    const parts = bigNumber.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (parts.length === 1 || decimals === 0) return integerPart;

    const decimalPart = parts[1].slice(0, decimals).replace(/0+$/, '');

    if (!decimalPart) return integerPart;

    return `${integerPart}.${decimalPart}`;
  };

  const formatScale: FormatScale = (value, decimals) => {
    const bigNumber: big.Big = Big(value);
    const scales = [
      { suffix: 'T', threshold: Big(1e12) },
      { suffix: 'B', threshold: Big(1e9) },
      { suffix: 'M', threshold: Big(1e6) },
      { suffix: 'K', threshold: Big(1e3) },
    ];

    for (const scale of scales) {
      if (bigNumber.gte(scale.threshold)) {
        const formatted = formatNumber(
          bigNumber.div(scale.threshold).toString(),
          decimals,
        );

        return `${formatted} ${scale.suffix}`;
      }
    }

    return formatNumber(bigNumber.toString(), decimals);
  };

  const formatSize: FormatSize = (value, decimals) => {
    const bigNumber: big.Big = Big(value);
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

    if (bigNumber.eq(0)) return '0 B';

    const i = Math.floor(Math.log(bigNumber.toNumber()) / Math.log(1024));
    const converted = bigNumber.div(Big(1024).pow(i)).toString();
    const formatted = formatNumber(converted, decimals);

    return `${formatted} ${sizes[i]}`;
  };
  const yoctoToNear: YoctoToNear = (yocto) =>
    Big(yocto).div(YOCTO_PER_NEAR).toString();
  const shortenHash: ShortenHash = (hash) =>
    `${hash && hash.slice(0, 6)}...${hash.slice(-4)}`;
  const shortenAddress: ShortenAddress = (address) => {
    const string = String(address);

    if (string.length <= 20) return string;

    return `${string.slice(0, 10)}...${string.slice(-7)}`;
  };
  const isValidAccount: IsValidAccount = (accountId) => {
    return (
      accountId.length >= 2 &&
      accountId.length <= 64 &&
      ACCOUNT_ID_REGEX.test(accountId)
    );
  };

  return {
    formatNumber,
    formatScale,
    formatSize,
    isValidAccount,
    shortenAddress,
    shortenHash,
    yoctoToNear,
  };
};

export default formatter;
