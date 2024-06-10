import type { RpcResponse } from 'nb-near';

type RetryFetch = (
  url: string,
  options?: FetchOptions,
) => Promise<FetchResponseSuccess>;
type RpcFetch = <T>(url: string, method: string, params: unknown) => Promise<T>;
type ApiFetch = <T>(url: string) => Promise<T>;

export type FetcherModule = {
  apiFetch: ApiFetch;
  retryFetch: RetryFetch;
  rpcFetch: RpcFetch;
};

const fetcher = () => {
  const retryFetch: RetryFetch = (url: string, options?: FetchOptions) => {
    let attempts = 0;
    const retries = 3;

    const makeRequest = (): Promise<FetchResponseSuccess> => {
      return new Promise((resolve, reject) => {
        asyncFetch(url, options)
          .then((response) => {
            if (response.ok) {
              return resolve(response);
            }

            return reject(response);
          })
          .catch(reject);
      });
    };

    const attemptRequest = (): Promise<FetchResponseSuccess> => {
      return makeRequest()
        .then((response) => response)
        .catch((error) => {
          if (attempts < retries) {
            attempts++;
            const delay = 1000 * Math.pow(2, attempts);

            return new Promise((resolve) => setTimeout(resolve, delay)).then(
              attemptRequest,
            );
          } else {
            return Promise.reject(error);
          }
        });
    };

    return attemptRequest();
  };

  const rpcFetch: RpcFetch = <T>(
    url: string,
    method: string,
    params: unknown,
  ): Promise<T> => {
    const options: FetchOptions = {
      body: JSON.stringify({
        id: 'near',
        jsonrpc: '2.0',
        method,
        params,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    };

    return new Promise((resolve, reject) => {
      retryFetch(url, options)
        .then((response) => {
          const body = response.body as unknown as RpcResponse<T>;

          if (body.result) {
            return resolve(body.result as T);
          }

          return reject(body.error);
        })
        .catch(reject);
    });
  };

  const apiFetch: ApiFetch = <T>(url: string): Promise<T> => {
    const options: FetchOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    return new Promise((resolve, reject) => {
      retryFetch(url, options)
        .then((response) => {
          resolve(response.body as T);
        })
        .catch(reject);
    });
  };

  return { apiFetch, retryFetch, rpcFetch };
};

export default fetcher;
