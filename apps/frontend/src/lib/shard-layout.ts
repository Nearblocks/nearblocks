export const mapAccountToShard = (
  accountId: string,
  boundaries: readonly string[],
): number => {
  let shard = 0;
  for (const boundary of boundaries) {
    if (accountId >= boundary) shard++;
    else break;
  }
  return shard;
};
