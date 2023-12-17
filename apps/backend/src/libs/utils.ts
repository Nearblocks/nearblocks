export const splitArray = <T>(array: T[]): [T[], T[]] => {
  if (!array || !array.length) return [[], []];

  const length = array.length;
  const midpoint = Math.ceil(length / 2);

  if (length === 1) return [array, []];

  return [array.slice(0, midpoint), array.slice(midpoint, length)];
};

export const SECOND = 1;
export const MINUTE = 60;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const validator = {
  accountIdSuffix: {
    lockup: 'lockup.near',
    stakingPool: {
      guildnet: undefined,
      localnet: undefined,
      mainnet: '.poolv1.near',
      shardnet: undefined,
      testnet: undefined,
    },
  },
};
