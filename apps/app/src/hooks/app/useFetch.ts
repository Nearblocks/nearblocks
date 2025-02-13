import axios, { AxiosRequestConfig } from 'axios';
import React from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

import RateLimitDialog from '@/components/app/RateLimitDialog';
import { apiUrl } from '@/utils/app/config';

import { useConfig } from './useConfig';

const baseURL = apiUrl;

export const defaultOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
};

const request = axios.create({ baseURL, timeout: 10000 });

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

export const useFetch = (initialUrl?: string, options?: AxiosRequestConfig) => {
  const config = { ...defaultOptions, ...options };
  const { apiAccessKey: token, apiUrl: baseURL } = useConfig();

  const fetcher = async (
    fetchUrl: string,
    fetchOptions?: AxiosRequestConfig,
  ) => {
    const response = await axios.get(fetchUrl, {
      baseURL,
      headers: token ? { Authorization: 'Bearer ' + token } : {},
      ...fetchOptions,
    });
    return response.data;
  };

  const { data, error, mutate } = useSWR(
    initialUrl ? [initialUrl, token] : null,
    ([url]) => fetcher(url),
    config,
  );

  return {
    data,
    error,
    fetcher, // Expose fetcher for dynamic usage
    loading: !error && !data,
    mutate, // Expose mutate for cache revalidation
  };
};
