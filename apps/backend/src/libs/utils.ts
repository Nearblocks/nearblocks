export const splitArray = <T>(array: T[]): [T[], T[]] => {
  if (!array || !array.length) return [[], []];

  const length = array.length;
  const midpoint = Math.ceil(length / 2);

  if (length === 1) return [array, []];

  return [array.slice(0, midpoint), array.slice(midpoint, length)];
};
