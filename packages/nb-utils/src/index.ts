export type Options = {
  retries?: number;
};

export type Context = {
  attempt: number;
};

const NS_IN_A_MS = 10n ** 6n;

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <A>(
  func: (context: Context) => A | Promise<A>,
  options: Options = {},
): Promise<A> => {
  let retries = options?.retries || 5;
  retries = retries < 1 ? 5 : retries;

  for (let i = 0; i < retries; i++) {
    const attempt = i + 1;

    try {
      return await func({ attempt });
    } catch (error) {
      await sleep(50);

      if (retries === attempt) {
        throw error;
      }
    }
  }

  throw new Error(`failed retrying ${retries} times...`);
};

export const msToNsTime = (ms: number) => String(BigInt(ms) * NS_IN_A_MS);

export const nsToMsTime = (ns: string) => +String(BigInt(ns) / NS_IN_A_MS);
