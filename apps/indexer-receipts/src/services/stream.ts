import { runReceiptsBackfill } from '#scripts/backfill';

export const syncData = async () => {
  await runReceiptsBackfill();
};
