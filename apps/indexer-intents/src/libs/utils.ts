export const big = (v: bigint | boolean | number | string) =>
  v == null ? null : BigInt(v);
