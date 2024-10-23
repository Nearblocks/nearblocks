import useSWR from 'swr';
import axios from 'axios';
import { toast } from 'react-toastify';
import { env } from 'next-runtime-env';

import useStorage from './useStorage';
import RateLimitDialog from '@/components/RateLimitDialog';
import React from 'react';

const baseURL = env('NEXT_PUBLIC_USER_API_URL');

export const defaultOptions = {
  revalidateOnFocus: false,
  shouldRetryOnError: false,
  revalidateOnReconnect: false,
};

export const fetcher = ([url, token]: [string, string | null], options = {}) =>
  axios
    .get(url, {
      baseURL,
      headers: token ? { Authorization: 'Bearer ' + token } : {},
      ...options,
    })
    .then((res) => res.data);

export const request = axios.create({
  baseURL,
});

request.interceptors.request.use(
  (conf) => {
    var accessToken = null;

    if (typeof window !== 'undefined') {
      accessToken = JSON.parse(localStorage.getItem('token') as string);
    }

    if (accessToken) {
      conf.headers.Authorization = `Bearer ${accessToken}`;
    }

    return conf;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(undefined, (error) => {
  if (error?.response?.status === 429) {
    toast.warn(React.createElement(RateLimitDialog), {
      toastId: 'rateLimit',
      autoClose: false,
    });
  }
  if (error?.response?.status === 403) {
    // Clear the token when a 403 error occurs
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }
  return Promise.reject(error);
});

const useAuth = (url: string, options = {}) => {
  const [token] = useStorage('token');
  const config = { ...defaultOptions, ...options };
  const { data, error, mutate } = useSWR([url, token], fetcher, config);

  return {
    data,
    error,
    loading: !error && !data,
    mutate,
  };
};

export default useAuth;
