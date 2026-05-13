// Boundary accounts for NEAR Nightshade V2 sharding.
// Update when nearcore reshards. Source: EXPERIMENTAL_protocol_config → shard_layout.V2.boundary_accounts.
const BOUNDARY_ACCOUNTS = [
  '650',
  'aurora',
  'aurora-0',
  'earn.kaiching',
  'game.hot.tg',
  'game.hot.tg-0',
  'kkuuue2akv_1630967379.near',
  'tge-lockup.sweat',
] as const;

export const SHARD_COUNT = BOUNDARY_ACCOUNTS.length + 1;

export const mapAccountToShard = (accountId: string): number => {
  let shard = 0;
  for (const boundary of BOUNDARY_ACCOUNTS) {
    if (accountId >= boundary) shard++;
    else break;
  }
  return shard;
};
