import { NextFunction, Request, Response } from 'express';

import config from '#config';

const DEPRECATED_AT = Date.parse('2026-11-06T00:00:00Z');
const LEGACY = /^\/v[12](\/|$)/;
// Internal probes, not part of the public API.
const KEEP = /^\/v1\/(health|sync)(\/|$)/;

/**
 * v1 and v2 are deprecated in favour of v3. Responses carry Deprecation and
 * Sunset headers (RFC 9745, RFC 8594); after the network's sunset they are 410.
 */
const legacyApi = (req: Request, res: Response, next: NextFunction) => {
  if (!LEGACY.test(req.path) || KEEP.test(req.path)) return next();

  const sunset = config.legacyApiSunset;
  res.setHeader('Deprecation', `@${Math.floor(DEPRECATED_AT / 1000)}`);
  res.setHeader('Sunset', sunset.toUTCString());
  res.setHeader('Link', '</api-docs/migration>; rel="deprecation"');
  if (Date.now() < sunset.getTime()) return next();

  return res.status(410).json({
    data: null,
    errors: [
      {
        message: `API ${req.path.slice(1, 3)} was retired on ${sunset.toISOString().slice(0, 10)}. Use /v3; see /api-docs/migration.`,
      },
    ],
  });
};

export default legacyApi;
