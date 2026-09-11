import { describe, expect, it } from 'vitest';

import type { FastnearUpstream } from '#upstream/fastnear';
import { shouldCooldown, UpstreamPool } from '#upstream/pool';

const BASE_MS = 60_000;
const MAX_MS = 900_000;

const fake = (name: string) => ({ name, upstream: {} as FastnearUpstream });

const makePool = (...names: string[]) =>
  new UpstreamPool(names.map(fake), BASE_MS, MAX_MS);

const httpError = (status: number, retryAfterMs?: number) =>
  Object.assign(new Error(`status ${status}`), { retryAfterMs, status });

describe('shouldCooldown', () => {
  it('parks only on rate limits', () => {
    expect(shouldCooldown(httpError(429))).toBe(true);
    expect(shouldCooldown(httpError(503))).toBe(true);
  });

  // A 404 is a statement about the block, not the endpoint. Parking on it
  // would take a healthy endpoint out of rotation at every chain tip.
  it('does not park on 404, 500 or transport errors', () => {
    expect(shouldCooldown(httpError(404))).toBe(false);
    expect(shouldCooldown(httpError(500))).toBe(false);
    expect(shouldCooldown(new Error('socket hang up'))).toBe(false);
    expect(shouldCooldown(undefined)).toBe(false);
  });
});

describe('UpstreamPool', () => {
  it('returns endpoints in configured priority order', () => {
    const pool = makePool('vm-a', 'vm-b', 'fastnear');

    expect(pool.available().map((e) => e.name)).toEqual([
      'vm-a',
      'vm-b',
      'fastnear',
    ]);
  });

  it('skips a parked endpoint but keeps the rest in order', () => {
    const pool = makePool('vm-a', 'vm-b', 'fastnear');
    const now = 1_000;

    pool.penalise('vm-a', httpError(429), now);

    expect(pool.available(now).map((e) => e.name)).toEqual([
      'vm-b',
      'fastnear',
    ]);
  });

  it('restores an endpoint once its cooldown expires', () => {
    const pool = makePool('vm-a', 'fastnear');
    const now = 1_000;

    pool.penalise('vm-a', httpError(429), now);

    expect(pool.available(now + BASE_MS - 1).map((e) => e.name)).toEqual([
      'fastnear',
    ]);
    expect(pool.available(now + BASE_MS).map((e) => e.name)).toEqual([
      'vm-a',
      'fastnear',
    ]);
  });

  it('doubles the backoff per consecutive limit, capped at max', () => {
    const pool = makePool('vm-a', 'fastnear');
    const now = 0;

    pool.penalise('vm-a', httpError(429), now);
    expect(pool.available(now + BASE_MS).map((e) => e.name)).toContain('vm-a');

    pool.penalise('vm-a', httpError(429), now);
    expect(pool.available(now + BASE_MS).map((e) => e.name)).not.toContain(
      'vm-a',
    );
    expect(pool.available(now + BASE_MS * 2).map((e) => e.name)).toContain(
      'vm-a',
    );

    // 2^n would run away; the cap is what keeps a flapping endpoint returnable.
    for (let i = 0; i < 40; i++) pool.penalise('vm-a', httpError(429), now);
    expect(pool.available(now + MAX_MS).map((e) => e.name)).toContain('vm-a');
  });

  it('honours Retry-After between the base and the cap', () => {
    const pool = makePool('vm-a', 'fastnear');
    const now = 0;

    pool.penalise('vm-a', httpError(429, BASE_MS * 3), now);

    expect(
      pool.available(now + BASE_MS * 3 - 1).map((e) => e.name),
    ).not.toContain('vm-a');
    expect(pool.available(now + BASE_MS * 3).map((e) => e.name)).toContain(
      'vm-a',
    );
  });

  // Retry-After is remote input: unclamped it could park an endpoint for years
  // (or, at zero, disable resting entirely and let us hammer a limited host).
  it('clamps an absurd Retry-After to the cap', () => {
    const pool = makePool('vm-a', 'fastnear');
    const now = 0;

    pool.penalise('vm-a', httpError(429, 315_360_000_000), now);

    expect(pool.available(now + MAX_MS).map((e) => e.name)).toContain('vm-a');
  });

  it('floors a zero or negative Retry-After at the base delay', () => {
    const pool = makePool('vm-a', 'fastnear');
    const now = 0;

    pool.penalise('vm-a', httpError(429, 0), now);

    expect(pool.available(now).map((e) => e.name)).not.toContain('vm-a');
    expect(pool.available(now + BASE_MS).map((e) => e.name)).toContain('vm-a');
  });

  // Concurrent height fetches make this ordering routine: a request that
  // started before the 429 finishes after it and would wipe the cooldown.
  it('ignores a stale success that would clear a newer cooldown', () => {
    const pool = makePool('vm-a', 'fastnear');
    const now = 0;

    const generation = pool.generationOf('vm-a');
    pool.penalise('vm-a', httpError(429), now);
    pool.reset('vm-a', generation);

    expect(pool.available(now).map((e) => e.name)).not.toContain('vm-a');

    pool.reset('vm-a', pool.generationOf('vm-a'));
    expect(pool.available(now).map((e) => e.name)).toContain('vm-a');
  });

  it('exposes resting endpoints so a would-be 404 can wake them', () => {
    const pool = makePool('vm-a', 'fastnear');
    const now = 0;

    expect(pool.resting(now)).toEqual([]);

    pool.penalise('vm-a', httpError(429), now);

    expect(pool.resting(now).map((e) => e.name)).toEqual(['vm-a']);
    expect(pool.resting(now + BASE_MS)).toEqual([]);
  });

  // available() already falls back to the soonest, so there is nothing extra
  // to wake and resting() must not hand back a duplicate of it.
  it('reports nothing resting when every endpoint is resting', () => {
    const pool = makePool('vm-a', 'fastnear');
    const now = 0;

    pool.penalise('vm-a', httpError(429), now);
    pool.penalise('fastnear', httpError(429), now);

    expect(pool.resting(now)).toEqual([]);
  });

  it('clears the backoff after a success', () => {
    const pool = makePool('vm-a', 'fastnear');
    const now = 0;

    pool.penalise('vm-a', httpError(429), now);
    pool.penalise('vm-a', httpError(429), now);
    pool.reset('vm-a');

    expect(pool.available(now).map((e) => e.name)).toContain('vm-a');

    // The next limit starts from base again, not from where it left off.
    pool.penalise('vm-a', httpError(429), now);
    expect(pool.available(now + BASE_MS).map((e) => e.name)).toContain('vm-a');
  });

  // Stalling every indexer is worse than one more rate-limited request.
  it('still returns the soonest endpoint when all are cooling down', () => {
    const pool = makePool('vm-a', 'fastnear');
    const now = 0;

    // Above the base delay, so the floor leaves them distinguishable.
    pool.penalise('vm-a', httpError(429, BASE_MS * 3), now);
    pool.penalise('fastnear', httpError(429, BASE_MS * 2), now);

    expect(pool.available(now).map((e) => e.name)).toEqual(['fastnear']);
  });

  it('reports cooldown state for the gauge', () => {
    const pool = makePool('vm-a', 'fastnear');
    const now = 0;

    pool.penalise('vm-a', httpError(429), now);

    expect(pool.cooldownState(now)).toEqual([
      { cooling: true, name: 'vm-a' },
      { cooling: false, name: 'fastnear' },
    ]);
    expect(pool.cooldownState(now + BASE_MS)).toEqual([
      { cooling: false, name: 'vm-a' },
      { cooling: false, name: 'fastnear' },
    ]);
  });

  it('is inert when no upstreams are configured', () => {
    const pool = new UpstreamPool([], BASE_MS, MAX_MS);

    expect(pool.available()).toEqual([]);
    expect(pool.names()).toEqual([]);
    expect(() => pool.penalise('nope', httpError(429))).not.toThrow();
    expect(() => pool.reset('nope')).not.toThrow();
  });
});
