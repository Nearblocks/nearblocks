/**
 * Bound the lifetime of an in-flight singleflight entry.
 *
 * The dedup map hands every concurrent request for a height the *same*
 * promise. Removal from the map is driven by that promise settling, so a
 * promise that never settles pins its entry forever and every later request
 * for that height attaches to a corpse instead of retrying upstream.
 *
 * That is not hypothetical: a stranded upstream promise held one mainnet
 * height for 3h43m. Every indexer resumes from the same persisted height
 * after a crash, so a single poisoned height stalls every consumer until the
 * process is restarted by hand.
 *
 * `withDeadline` guarantees the returned promise settles within `ttlMs`
 * whatever the underlying promise does, which lets the caller release the
 * entry and lets the next request start a fresh attempt.
 *
 * Note there is deliberately no `promise.catch()` guard on the input: the
 * rejection handler below is attached synchronously in this same tick and
 * stays attached, so a late rejection is always consumed and can never reach
 * the process-level unhandledRejection handler.
 */
export function withDeadline<T>(
  promise: Promise<T>,
  ttlMs: number,
  onDeadline: () => Error,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      // onDeadline is caller-supplied and does real work (metrics, logging).
      // It runs in a macrotask, outside the executor's implicit try/catch, so
      // a throw here would escape as an uncaught exception AND skip `reject`,
      // leaving the promise unsettled — recreating the exact immortal entry
      // this module exists to prevent, while also killing the process.
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
