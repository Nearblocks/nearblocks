import { sleep } from '#libs/utils';

type Options = {
  retries?: number;
};

type Context = {
  attempt: number;
};

const retry = async <A>(
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

export default retry;
