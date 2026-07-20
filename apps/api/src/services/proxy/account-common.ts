// Helpers shared by the v1/v2 `/account/*` proxy services (account.ts,
// account-txn.ts, account-token.ts).

import dayjs from '#libs/dayjs';
import { uncappedNumber } from '#libs/proxy';
import { msToNsTime } from '#libs/utils';

/**
 * v1 `before_date` (YYYY-MM-DD, exclusive upper bound) -> the v3 `before` ns
 * bound. Identical arithmetic to the legacy handlers, which compared
 * `block_timestamp < msToNsTime(startOf('day'))`.
 */
export const beforeTs = (beforeDate?: string): string | undefined => {
  if (!beforeDate) return undefined;

  return String(
    msToNsTime(dayjs(beforeDate, 'YYYY-MM-DD', true).startOf('day').valueOf()),
  );
};

/**
 * v3 emits every big integer as a string; the legacy `JSON_BUILD_OBJECT` /
 * `ROW_TO_JSON` shapes emitted them as JSON numbers. Missing values stay `null`
 * instead of collapsing to `0` (which `toNumber` would do).
 */
export const numberOrNull = (
  value: null | number | string | undefined,
): null | number => {
  if (value === null || value === undefined || value === '') return null;

  const num = Number(value);

  return Number.isFinite(num) ? num : null;
};

/**
 * The v1 count envelopes carry a bare numeric string. v3 counts are capped
 * strings ("10000+"); the cap suffix is stripped, so a true count above
 * `maxQueryCount` is reported as the cap.
 */
export const legacyCount = (count: null | number | string): string =>
  String(uncappedNumber(count));
