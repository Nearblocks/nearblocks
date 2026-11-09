import type { NextFunction, Request, Response } from 'express';

import { kitwalletClients } from '#libs/promMetrics';

// Which wallets call the kitwallet endpoints, from Origin/Referer and User-Agent.
// Label values are capped so unexpected callers can't blow up metric cardinality.
const MAX_LABELS = 50;
const seen = {
  agent: new Set<string>(),
  host: new Set<string>(),
  origin: new Set<string>(),
};

const capped = (kind: keyof typeof seen, value: string) => {
  if (seen[kind].has(value)) return value;
  if (seen[kind].size >= MAX_LABELS) return 'other';
  seen[kind].add(value);
  return value;
};

const originOf = (req: Request): string => {
  const raw = req.get('origin') || req.get('referer');
  if (!raw || raw === 'null') return 'none';
  try {
    const url = new URL(raw);
    return url.protocol === 'chrome-extension:' ||
      url.protocol === 'moz-extension:'
      ? `${url.protocol}//${url.host}`
      : url.hostname;
  } catch {
    return 'invalid';
  }
};

// Browser family for browsers; otherwise the first product token, which apps and
// HTTP libraries usually set to their own name (e.g. okhttp, Dart, MyWallet).
const agentOf = (ua: string | undefined): string => {
  if (!ua) return 'none';
  const browser = /\b(Edg|OPR|Firefox|Chrome|Safari)\//.exec(ua)?.[1];
  if (ua.startsWith('Mozilla/') && browser) return browser;
  const product = /^[A-Za-z][\w.-]{0,31}/.exec(ua)?.[0];
  return product ?? 'other';
};

export const kitwalletClientMetrics = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.path.startsWith('/v3/kitwallet/')) {
    kitwalletClients.inc({
      agent: capped('agent', agentOf(req.get('user-agent'))),
      host: capped('host', req.hostname || 'none'),
      // Presence only (auth runs later); enough to tell keyed callers apart.
      key: req.get('authorization') || req.query.apikey ? 'yes' : 'no',
      origin: capped('origin', originOf(req)),
    });
  }
  next();
};
