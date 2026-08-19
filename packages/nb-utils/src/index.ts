export type Options = {
  delay?: number;
  exponential?: boolean;
  logger?: (attempt: number, error: unknown) => void;
  retries?: number;
};

export type Context = {
  attempt: number;
};

const NS_IN_A_MS = 10n ** 6n;
const YOCTO_IN_A_NEAR = 10n ** 24n;

const emptyLogger = () => {};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <A>(
  func: (context: Context) => A | Promise<A>,
  options: Options = {},
): Promise<A> => {
  const delay = options?.delay || 50;
  const exponential = options?.exponential || false;
  const logger = options.logger ?? emptyLogger;
  let retries = options?.retries || 5;
  retries = retries < 1 ? 5 : retries;

  for (let i = 0; i < retries; i++) {
    const attempt = i + 1;

    try {
      return await func({ attempt });
    } catch (error) {
      logger(attempt, error);

      if (exponential) {
        await sleep(Math.pow(2, attempt) * 100 + Math.random() * 100);
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

export const decodeBorshAccountKey = (
  key: Buffer,
  prefix: Buffer,
): null | string => {
  if (key.length <= prefix.length + 4) return null;
  if (!key.subarray(0, prefix.length).equals(prefix)) return null;

  const rest = key.subarray(prefix.length);
  const len = rest.readUInt32LE(0);

  if (rest.length !== 4 + len) return null;

  return rest.subarray(4, 4 + len).toString('utf8');
};

export const decodeU128LE = (value: Buffer): bigint => {
  if (value.length !== 16) {
    throw new Error(`expected 16-byte u128le value, got ${value.length}`);
  }

  const lo = value.readBigUInt64LE(0);
  const hi = value.readBigUInt64LE(8);

  return lo + (hi << 64n);
};

export const decodeU128LEAt = (
  value: Buffer,
  offset: number,
): bigint | null => {
  if (offset < 0 || offset + 16 > value.length) return null;

  const lo = value.readBigUInt64LE(offset);
  const hi = value.readBigUInt64LE(offset + 8);

  return lo + (hi << 64n);
};

export const readJsonPath = (source: unknown, path: string): unknown => {
  let current = source;

  for (const segment of path.split('.')) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  return current;
};

export const decodeBorshString = (
  value: Buffer,
  offset: number,
): { end: number; text: string } | null => {
  if (offset < 0 || offset + 4 > value.length) return null;

  const len = value.readUInt32LE(offset);
  const start = offset + 4;
  const end = start + len;

  if (end > value.length) return null;

  return { end, text: value.subarray(start, end).toString('utf8') };
};
