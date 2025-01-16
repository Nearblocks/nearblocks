import axios, { AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import React from 'react';
import { toast } from 'react-toastify';

import RateLimitDialog from '@/components/app/RateLimitDialog';

import { useSWR } from '../../utils/app/swrExport';
import { useConfig } from './useConfig';
import useStorage from './useStorage';

export const defaultOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
};

declare module 'axios' {
  export interface AxiosRequestConfig {
    attempt?: number;
    refreshInterval?: number;
    retries?: number;
    revalidateOnReconnect?: boolean;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const dynamicRequest = (baseUrl: string) => {
  const instance = axios.create({
    baseURL: baseUrl,
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      let accessToken = null;

      if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('token');
      }
      if (accessToken) {
        config.headers.Authorization = `Bearer ${JSON.parse(accessToken)}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;

      if (response?.status === 429) {
        toast.warn(React.createElement(RateLimitDialog), {
          autoClose: false,
          toastId: 'rateLimit',
        });
      }

      if (response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        Cookies.remove('token');
        Cookies.remove('role');
        Cookies.remove('user');
      }

      if (!config || !config.attempt) return Promise.reject(error);

      const retries = config.retries ?? 5;
      config.attempt = (config.attempt || 0) + 1;
      const delay = 1000 * 2 ** config.attempt;
      config.attempt += 1;

      if (config.attempt > retries) {
        return Promise.reject(error);
      }

      await sleep(delay);
      return instance(config); // Retry the original request
    },
  );
  return instance;
};

export const request = dynamicRequest;

const useAuth = (url: string, options = {}, userInfo: boolean = false) => {
  const [token] = useStorage('token');
  const config = { ...defaultOptions, ...options };
  const { userApiURL, userAuthURL } = useConfig();

  const baseURL = userInfo ? userAuthURL : userApiURL;

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
