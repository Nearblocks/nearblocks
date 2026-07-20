import { headers } from 'next/headers';
import { cache } from 'react';
import 'server-only';

const HOLD_MS = 800;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Per-request set of every data promise kicked off through `fetcher` during
// this render. React cache() scopes the Set to the request, and fetchers run
// (and register) synchronously up to their first await when a page kicks them
// off — before that page's own holdNav() snapshot. So each segment's hold is
// guaranteed to cover its own fetches without hand-maintained promise arrays,
// which only ever drifted (a fetch added but not held = silent skeleton flash).
const registry = cache(() => new Set<Promise<unknown>>());

// Shared per-request hold budget: layouts and pages compose (a layout's
// holdNav resolves before its child page renders), so without a shared
// deadline a section with a holding layout would pay two sequential holds
// (up to 1.6s). The first holdNav call starts the clock; later calls in the
// same request only get whatever budget remains.
const holdState = cache(() => ({ deadline: null as null | number }));

export const trackForHold = <T>(promise: Promise<T>): Promise<T> => {
  try {
    registry().add(promise);
  } catch {
    // Outside a request scope (build-time analysis, tests) there is no
    // navigation to hold.
  }
  return promise;
};

/**
 * Hold a client-side navigation for up to `ms` while the data promises kicked
 * off so far this request settle. Fast responses then stream in with their
 * data already resolved, so the page swaps in complete instead of flashing
 * skeleton fallbacks; slower responses fall back to streaming with skeletons
 * as usual. Call after kicking off the segment's fetches, before returning
 * JSX — promises auto-register via `fetcher`, so no arguments are needed.
 *
 * Document requests (TTFB/SEO) pass through untouched. Next strips its router
 * headers (RSC, Next-Router-Prefetch, ...) before `headers()`, so the accept
 * header is the only reliable discriminator: browsers request documents with
 * `text/html`, while the router's flight fetches use the default `*∕*`. Our
 * Link disables prefetching (see components/link.tsx), so every non-document
 * request to a page is a real navigation.
 */
export const holdNav = async (ms: number = HOLD_MS): Promise<void> => {
  const reqHeaders = await headers();
  const accept = reqHeaders.get('accept') ?? '';
  // Only the router's flight fetches should pay the hold. text/html =
  // document request, text/x-component = server action POST re-rendering the
  // page. Beyond accept, require sec-fetch-mode: cors (what browser fetch()
  // sends on flight requests): non-browser document clients — curl, health
  // probes, link unfurlers — send Accept: */* with no sec-fetch-mode and
  // would otherwise be misclassified as navigations. Browsers too old for
  // sec-fetch degrade to pre-hold behavior (skeletons), never to a stall.
  const skipHold =
    accept.includes('text/html') ||
    accept.includes('text/x-component') ||
    reqHeaders.get('sec-fetch-mode') !== 'cors';

  if (skipHold) return;

  let promises: Promise<unknown>[];
  let state: { deadline: null | number };
  try {
    promises = [...registry()];
    state = holdState();
  } catch {
    return;
  }

  const now = Date.now();
  if (state.deadline === null) state.deadline = now + ms;
  const remaining = Math.min(ms, state.deadline - now);
  if (remaining <= 0) return;

  await Promise.race([Promise.allSettled(promises), sleep(remaining)]);
};
