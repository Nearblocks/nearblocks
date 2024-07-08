import type { Debounce } from '@/types/types';

const initial = {
  account: undefined,
  block: undefined,
  query: undefined,
  receipt: undefined,
  txn: undefined,
};

const search = () => {
  let { getAccount, getBlock, getReceipt, getTxn } = VM.require<any>(
    `${config_account}/widget/lite.libs.rpc`,
  );
  let { isValidAccount } = VM.require<any>(
    `${config_account}/widget/lite.libs.formatter`,
  );
  const Search = (rpcUrl: string, query: any) => {
    const accountPromise = isValidAccount(query.toLocaleLowerCase())
      ? getAccount(rpcUrl, query.toLocaleLowerCase())
      : Promise.resolve(undefined);

    const blockPromise =
      query.length >= 43
        ? getBlock(rpcUrl, query)
        : !isNaN(Number(query))
        ? getBlock(rpcUrl, Number(query))
        : Promise.resolve(undefined);

    const txnPromise =
      query.length >= 43 ? getTxn(rpcUrl, query) : Promise.resolve(undefined);

    const receiptPromise =
      query.length >= 43
        ? getReceipt(rpcUrl, query)
        : Promise.resolve(undefined);

    return Promise.all([
      accountPromise,
      blockPromise,
      txnPromise,
      receiptPromise,
    ])
      .then(([account, block, txn, receipt]) => {
        const data = {
          account: account?.result,
          block: block?.result,
          query,
          receipt: receipt?.result,
          txn: txn?.result,
        };
        return data;
      })
      .catch((error) => {
        console.error('Error:', error);
        return initial;
      });
  };

  function debounce(
    delay: number,
    func: (url: string, value: string) => void,
  ): Debounce {
    let timer: NodeJS.Timeout | undefined;
    let active = true;
    let lastArgs: [string, string];

    const debounced = (url: string, value: string) => {
      lastArgs = [url, value];
      if (active) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (active) {
            func(url, value);
          }
          timer = undefined;
        }, delay);
      } else {
        func(url, value);
      }
    };

    debounced.isPending = () => {
      return timer !== undefined;
    };

    debounced.cancel = () => {
      active = false;
      clearTimeout(timer);
    };

    debounced.flush = () => {
      if (timer) {
        clearTimeout(timer);
        func(...lastArgs);
      }
    };

    return debounced;
  }

  return { debounce, Search };
};

export default search;
