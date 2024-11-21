import axios, { AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { useEnvContext } from 'next-runtime-env';
import React from 'react';
import { toast } from 'react-toastify';

import RateLimitDialog from '@/components/RateLimitDialog';

import { useSWR } from '../../utils/app/swrExport';
import useStorage from './useStorage';

const baseURL = process.env.NEXT_PUBLIC_USER_API_URL;

export const defaultOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
};

export const request = axios.create({ baseURL });

declare module 'axios' {
  export interface AxiosRequestConfig {
    attempt?: number;
    refreshInterval?: number;
    retries?: number;
    revalidateOnReconnect?: boolean;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

request.interceptors.request.use(
  (conf) => {
    let accessToken = null;

    if (typeof window !== 'undefined') {
      accessToken = localStorage.getItem('token');
    }

    if (accessToken) {
      conf.headers.Authorization = `Bearer ${JSON.parse(accessToken)}`;
    }

    return conf;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(undefined, async (error) => {
  if (error?.response?.status === 429) {
    toast.warn(React.createElement(RateLimitDialog), {
      autoClose: false,
      toastId: 'rateLimit',
    });
  }

  if (error?.response?.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('user');
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

const useAuth = (url: string, options = {}) => {
  const [token] = useStorage('token');
  const config = { ...defaultOptions, ...options };
  const { NEXT_PUBLIC_USER_API_URL: baseURL } = useEnvContext();

  const fetcher = async (
    [url, token]: [string, null | string],
    options?: AxiosRequestConfig,
  ) => {
    const response = await axios.get(url, {
      baseURL,
      headers: token ? { Authorization: 'Bearer ' + token } : {},
      ...options,
    });
    return response.data;
  };

  const { data, error, mutate } = useSWR([url, token], fetcher, config);

  return {
    data,
    error,
    loading: !error && !data,
    mutate,
  };
};

export default useAuth;
