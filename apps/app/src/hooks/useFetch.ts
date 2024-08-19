import useSWR from 'swr';
import axios, { AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import RateLimitDialog from '@/components/RateLimitDialog';
import React from 'react';
import { env } from 'next-runtime-env';

const fetchKey = env('NEXT_PUBLIC_API_FETCH_KEY');
const baseURL = env('NEXT_PUBLIC_API_URL');

export const defaultOptions = {
  revalidateOnFocus: false,
  shouldRetryOnError: false,
  revalidateOnReconnect: false,
};

const request = axios.create({ baseURL });

declare module 'axios' {
  export interface AxiosRequestConfig {
    attempt?: number;
    retries?: number;
    refreshInterval?: number;
    revalidateOnReconnect?: boolean;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

request.interceptors.response.use(undefined, async (error) => {
  if (error?.response?.status === 429) {
    toast.warn(React.createElement(RateLimitDialog), {
      toastId: 'rateLimit',
      autoClose: false,
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
      headers: {
        'Secs-Fetch-Key': fetchKey,
        ...(options?.headers || {}),
      },
      attempt: 1,
      ...options,
    })
    .then((res) => res.data)
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

export const poster = (
  url: string,
  data: any,
  options: AxiosRequestConfig = {},
) =>
  request
    .post(url, data, {
      headers: {
        'Secs-Fetch-Key': fetchKey,
        ...(options?.headers || {}),
      },
      attempt: 1,
      ...options,
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
