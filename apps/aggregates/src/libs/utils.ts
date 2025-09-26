export const getLimit = (timestamp: bigint) => {
  switch (true) {
    case timestamp < 1672531200000000000n: // 01/01/23
      return 10_000_000_000_000n; // 10000s in ns
    case timestamp < 1688169600000000000n: // 01/07/23
      return 5_000_000_000_000n; // 5000s in ns
    case timestamp < 1704067200000000000n: // 01/01/24
      return 2_500_000_000_000n; // 2000s in ns
    case timestamp < 1719792000000000000n: // 01/07/24
      return 1_000_000_000_000n; // 1000s in ns
    case timestamp < 1735689600000000000n: // 01/01/25
      return 500_000_000_000n; // 500s in ns
    case timestamp < 1751328000000000000n: // 01/07/25
      return 250_000_000_000n; // 250s in ns
    // default:
    //   return 10_000_000_000n; // 10s in ns
    default:
      return 100_000_000_000n; // 100s in ns
  }
};

export const big = (v: bigint | boolean | number | string) =>
  v == null ? null : BigInt(v);
