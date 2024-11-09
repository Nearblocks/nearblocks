import axios, { AxiosRequestConfig } from 'axios';
import { env } from 'next-runtime-env';
import React from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

import RateLimitDialog from '@/components/RateLimitDialog';

const fetchKey = env('NEXT_PUBLIC_API_FETCH_KEY');
const baseURL = env('NEXT_PUBLIC_API_URL');

export const defaultOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
};

const request = axios.create({ baseURL });

declare module 'axios' {
  export interface AxiosRequestConfig {
    attempt?: number;
    refreshInterval?: number;
    retries?: number;
    revalidateOnReconnect?: boolean;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

request.interceptors.response.use(undefined, async (error) => {
  if (error?.response?.status === 429) {
    toast.warn(React.createElement(RateLimitDialog), {
      autoClose: false,
      toastId: 'rateLimit',
    });
  }

  const { config } = error;

  if (!config || !config.attempt) return Promise.reject(error);

  const retries = config.retries ?? 5;
  const delay = 1000 * 2 ** config.attempt;
  config.attempt += 1;

  if (config.attempt > retries) return Promise.reject(error);

  await sleep(delay);

  return request.get(config.url, { attempt: config.attempt, retries });
});

export const fetcher = (url: string, options: AxiosRequestConfig = {}) => {
  return request
    .get(url, {
      attempt: 1,
      headers: {
        'Secs-Fetch-Key': fetchKey,
        ...(options?.headers || {}),
      },
      ...options,
    })
    .then((res) => res?.data)
    .catch((error) => {
      throw error;
    });
};

export const useFetch = <T = any>(
  url: string,
  options?: AxiosRequestConfig,
) => {
  const config = { ...defaultOptions, ...options };
  const { data, error } = useSWR<T>(url, (url) => fetcher(url, config), config);

  return {
    data,
    error,
    loading: !error && !data,
  };
};
