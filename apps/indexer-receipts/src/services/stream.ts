import { runReceiptsCheck } from '#scripts/check';

export const syncData = async () => {
  await runReceiptsCheck();
};
