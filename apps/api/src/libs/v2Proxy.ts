import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * In-process bridge for serving legacy v2 endpoints from the v3 implementation.
 *
 * v3 handlers are ordinary Express handlers (wrapped by `responseHandler`) that
 * read `req.validator` and emit the `{ data, meta }` envelope. A v2 endpoint can
 * therefore be served by composing three plain middlewares:
 *
 *   [ renameQuery(v2 -> v3 params), validate(v3Schema), proxyResponse(v3Handler, transform) ]
 *
 * `renameQuery` rewrites the incoming query so the v3 `validate` middleware can
 * populate `req.validator` unchanged; `proxyResponse` captures the v3 body
 * in-process and re-shapes it into the legacy v2 envelope.
 *
 * This keeps a single source of truth (the v3 query) while preserving the v2
 * contract. See PROXY-V2-TO-V3.md for the per-endpoint mapping and limitations.
 */

/** A v3 service handler, already wrapped by `responseHandler` / `catchAsync`. */
type V3Handler = (req: Request, res: Response, next: NextFunction) => void;

/** The v3 response envelope captured before re-shaping. */
type V3Body = {
  data?: unknown;
  errors?: unknown;
  meta?: { next_page?: string; prev_page?: string };
};

/** Re-shape a successful v3 `{ data, meta }` body into the legacy v2 shape. */
type Transform = (body: V3Body) => unknown;

/**
 * Rename incoming query params from their v2 names to the v3 names the v3
 * `validate` middleware expects. Builds a new query object (no in-place
 * mutation of the original); unmapped params pass through untouched and the
 * v3 valibot schema ignores any extras.
 */
export const renameQuery =
  (mapping: Record<string, string>): RequestHandler =>
  (req, _res, next) => {
    const query: Record<string, unknown> = { ...req.query };

    for (const [from, to] of Object.entries(mapping)) {
      if (from in query) {
        query[to] = query[from];
        delete query[from];
      }
    }

    req.query = query as Request['query'];
    next();
  };

/**
 * Run a v3 handler but capture its response in-process and re-shape it into the
 * legacy v2 envelope via `transform`. Non-200 responses and error envelopes are
 * passed through unchanged so existing v2 error handling is preserved.
 */
export const proxyResponse =
  (handler: V3Handler, transform: Transform): RequestHandler =>
  (req, res, next) => {
    let statusCode = 200;

    const capture = {
      json: (body: V3Body) => {
        if (statusCode !== 200 || body?.errors) {
          res.status(statusCode).json(body);
          return;
        }

        res.status(statusCode).json(transform(body));
      },
      status(code: number) {
        statusCode = code;
        return capture;
      },
    } as unknown as Response;

    handler(req, capture, next);
  };

/** List endpoint: `{ data, meta }` -> `{ [key]: data, cursor: meta.next_page }`. */
export const listEnvelope =
  (key: string): Transform =>
  (body) => ({ cursor: body.meta?.next_page, [key]: body.data ?? [] });

/** Count endpoint: `{ data: { count } }` -> `{ [key]: [{ count }] }`. */
export const countEnvelope =
  (key: string): Transform =>
  (body) => ({ [key]: [body.data] });
