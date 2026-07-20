import { Request, Response } from 'express';

// Handler for v1/v2 endpoints whose data no longer exists in the split DBs.
// When the proxy is enabled these can't be served, so we respond with a clear,
// machine-readable deprecation: RFC 8594 Deprecation/Link headers and 410 Gone
// with a pointer to the v3 migration guide.

const MIGRATION_URL = 'https://api.nearblocks.io/api-docs/migration';

export const deprecated = (_req: Request, res: Response) => {
  res.setHeader('Deprecation', 'true');
  res.setHeader('Link', `<${MIGRATION_URL}>; rel="deprecation"`);

  return res.status(410).json({
    data: null,
    errors: [
      {
        message:
          'This endpoint has no v3 equivalent and is no longer available. See the migration guide.',
        path: MIGRATION_URL,
      },
    ],
  });
};

export default { deprecated };
