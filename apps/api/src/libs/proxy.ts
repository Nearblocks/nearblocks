// Reformatting helpers for the v1/v2 back-compat proxy.
//
// The proxy reuses the existing v3 data functions and reshapes their output into
// the legacy v1/v2 JSON shape. These helpers cover the recurring value-format
// differences between v3 and v1/v2 responses.

import { NextFunction, Request, Response } from 'express';

import { CursorError } from '#libs/errors';

/**
 * Emits a value as a JSON string, preserving null. Several v1/v2 responses
 * carried wide numerics that the legacy driver surfaced as text where the v3
 * column is a narrow integer (e.g. `shard_id`: production v1 returns "4", v3
 * returns 4). Takes `unknown` so it can be applied to non-nullable v3 types
 * without a type-overlap error.
 */
export const toStringOrNull = (value: unknown): null | string =>
  value === null || value === undefined ? null : String(value);

/**
 * Rejects a request parameter the v3 data path cannot express, in the same 422
 * shape the v1 zod validator emits. Used instead of silently answering with an
 * unfiltered or first-page result, which would be a wrong answer rather than a
 * degraded one.
 */
export const rejected = (res: Response, param: string) =>
  res.status(422).json({
    errors: [
      {
        message: `'${param}' is no longer supported on this endpoint. See https://api.nearblocks.io/api-docs/migration`,
        path: [param],
      },
    ],
  });

/**
 * catchAsync for proxy handlers: an invalid v3 cursor (CursorError from
 * #libs/cursors decode) becomes a 422 in the v1 validator error shape instead
 * of falling through to the global 500 handler.
 */
export const proxyAsync =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (err instanceof CursorError) {
        return res
          .status(422)
          .json({ errors: [{ message: err.message, path: ['cursor'] }] });
      }

      return next(err);
    });
  };

/**
 * v3 exposes counts as capped strings (e.g. "10000+"); most v1 responses expect a
 * bare number. Strip the cap suffix and coerce; a non-numeric value falls back to 0.
 *
 * Note: this recovers the shape only — an exact count above the v3 cap is not
 * recoverable (documented as a non-1:1 match).
 */
export const uncappedNumber = (
  count: null | number | string | undefined,
): number => {
  if (count === null || count === undefined) return 0;

  const value = Number(String(count).replace('+', ''));

  return Number.isFinite(value) ? value : 0;
};

/**
 * Coerce a v3 numeric-string field back to a JSON number, matching the v1 shapes
 * that emit uncast `JSON_BUILD_OBJECT` numerics.
 */
export const toNumber = (value: null | number | string | undefined): number => {
  const num = Number(value ?? 0);

  return Number.isFinite(num) ? num : 0;
};

/**
 * v1 pagination used a raw column value (numeric `id`, `event_index`,
 * `block_height`) as the cursor; v3 uses an opaque base64 cursor. When proxying we
 * surface the v3 `meta.next_page` verbatim as the v1 `cursor` field. Clients that
 * treat the cursor as an opaque token keep working; clients that parsed or
 * constructed the old numeric cursor do not (documented as a non-1:1 match).
 */
export const legacyCursor = (nextPage?: string): string | undefined => nextPage;
