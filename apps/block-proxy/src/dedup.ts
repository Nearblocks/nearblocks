/**
 * Settle within `ttlMs` whatever the underlying promise does.
 *
 * Callers keyed on a shared promise (see the dedup map) release their entry
 * when it settles, so one that never settles pins the entry forever.
 *
 * No `promise.catch()` guard is needed: the rejection handler below is
 * attached synchronously and stays attached, so a late rejection is always
 * consumed.
 */
export function withDeadline<T>(
  promise: Promise<T>,
  ttlMs: number,
  onDeadline: () => Error,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      // Runs in a macrotask, outside the executor's try/catch: an unguarded
      // throw would skip `reject` and leave this unsettled.
      try {
        reject(onDeadline());
      } catch (err) {
        reject(
          new Error(
            `deadline exceeded after ${ttlMs}ms; onDeadline threw: ${err}`,
          ),
        );
      }
    }, ttlMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
