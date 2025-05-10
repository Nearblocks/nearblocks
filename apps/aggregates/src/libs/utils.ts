export const NS_IN_S = 1_000_000_000;

export const getLimit = (block: number) => {
  switch (true) {
    case block < 196_000_000:
      return 1_000;
    default:
      return 1;
  }
};

export const sToNs = (s: number) => Math.floor(s * NS_IN_S);
export const nsToS = (ns: string) => Math.floor(+ns / NS_IN_S);
