export const getLimit = (block: number) => {
  switch (true) {
    case block < 60_000_000:
      return 1_000;
    case block < 70_000_000:
      return 100;
    case block < 90_000_000:
      return 10;
    case block < 110_000_000:
      return 2;
    default:
      return 1;
  }
};
