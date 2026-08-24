import { describe, expect, it, vi } from 'vitest';

import { withDeadline } from './dedup.js';

const deadlineError = () => new Error('deadline');

describe('withDeadline', () => {
  it('resolves with the underlying value when it settles in time', async () => {
    await expect(
      withDeadline(Promise.resolve('block'), 1_000, deadlineError),
    ).resolves.toBe('block');
  });

  it('rejects with the underlying error when it fails in time', async () => {
    await expect(
      withDeadline(
        Promise.reject(new Error('upstream exhausted')),
        1_000,
        deadlineError,
      ),
    ).rejects.toThrow('upstream exhausted');
  });

  it('rejects once the deadline passes even if the underlying never settles', async () => {
    vi.useFakeTimers();

    try {
      // The failure mode this exists for: a promise that never settles.
      const promise = withDeadline(
        new Promise(() => {}),
        25_000,
        deadlineError,
      );
      const assertion = expect(promise).rejects.toThrow('deadline');

      await vi.advanceTimersByTimeAsync(25_000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it('still settles when onDeadline itself throws', async () => {
    vi.useFakeTimers();

    try {
      // onDeadline does real work (metrics, logging). It runs in a macrotask,
      // so an unguarded throw would escape as an uncaught exception AND skip
      // reject, leaving the entry immortal — the very bug this module fixes.
      const promise = withDeadline(new Promise(() => {}), 1_000, () => {
        throw new Error('metrics backend down');
      });
      const assertion = expect(promise).rejects.toThrow(
        /onDeadline threw.*metrics backend down/,
      );

      await vi.advanceTimersByTimeAsync(1_000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it('leaves no pending timer once the underlying settles', async () => {
    vi.useFakeTimers();

    try {
      await withDeadline(Promise.resolve('block'), 25_000, deadlineError);

      // Asserts the handle is actually gone, not merely that clearTimeout ran.
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not surface an unhandled rejection when the underlying fails late', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);

    try {
      let fail: (err: Error) => void = () => {};
      const underlying = new Promise<string>((_, reject) => {
        fail = reject;
      });

      const promise = withDeadline(underlying, 10, deadlineError);
      await expect(promise).rejects.toThrow('deadline');

      // Late rejection, after nothing is waiting on it any more. block-proxy
      // exits the process on unhandledRejection, so this must stay silent.
      fail(new Error('late upstream failure'));
      await new Promise((resolve) => setImmediate(resolve));

      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });
});
