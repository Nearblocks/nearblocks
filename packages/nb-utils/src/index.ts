export type Options = {
  delay?: number;
  exponential?: boolean;
  retries?: number;
};

export type Context = {
  attempt: number;
};

const NS_IN_A_MS = 10n ** 6n;
const YOCTO_IN_A_NEAR = 10n ** 24n;

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <A>(
  func: (context: Context) => A | Promise<A>,
  options: Options = {},
): Promise<A> => {
  const delay = options?.delay || 50;
  const exponential = options?.exponential || false;
  let retries = options?.retries || 5;
  retries = retries < 1 ? 5 : retries;

  for (let i = 0; i < retries; i++) {
    const attempt = i + 1;

    try {
      return await func({ attempt });
    } catch (error) {
      if (exponential) {
        Math.pow(2, attempt) * 100 + Math.random() * 100;
      } else {
        await sleep(delay);
      }

      if (retries === attempt) {
        throw error;
      }
    }
  }

  throw new Error(`failed retrying ${retries} times...`);
};

export const msToNsTime = (ms: number) => String(BigInt(ms) * NS_IN_A_MS);

export const nsToMsTime = (ns: string) => +String(BigInt(ns) / NS_IN_A_MS);

export const yoctoToNear = (yn: string) => String(BigInt(yn) / YOCTO_IN_A_NEAR);
