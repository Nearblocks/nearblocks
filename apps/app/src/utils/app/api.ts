import qs from 'qs';
import { apiUrl, apiUrlBeta, appUrl } from './config';

const fetchKey = process.env.API_ACCESS_KEY;

export const getRequest = async (
  path: string,
  params = {},
  options: RequestInit = {},
  useBase: boolean = true,
) => {
  if (!fetchKey) {
    throw new Error('Fetch key is not provided');
  }

  const queryParams = qs.stringify(params, { encode: true });
  const url = useBase
    ? `${apiUrl}${path}${queryParams ? `?${queryParams}` : ''}`
    : `${path}${queryParams ? `?${queryParams}` : ''}`;

  const MAX_RETRIES = 3;
  const TIMEOUT = 10000;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const headers = new Headers({
        Authorization: `Bearer ${fetchKey}`,
      });

      const mergedOptions: RequestInit = {
        headers,
        signal: controller.signal,
        ...options,
      };
      const response = await fetch(url, useBase ? mergedOptions : {});
      clearTimeout(timeoutId);

      if (response.status !== 200) {
        throw new Error(`${response.statusText}`);
      }

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('json');
        return isJson ? response.json() : response.text();
      }
    } catch (error: any) {
      clearTimeout(timeoutId);

      console.error(`Error on attempt ${attempt + 1} - ${url}:`, error);

      const delay = Math.pow(2, attempt) * 300;
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (attempt === MAX_RETRIES - 1) {
        return {
          message: 'Error',
          status: 500,
          error,
        };
      }
    }
  }
};

export const getRequestBeta = async (
  path: string,
  params = {},
  options: RequestInit = {},
  useBase: boolean = true,
) => {
  if (!fetchKey) {
    throw new Error('Fetch key is not provided');
  }

  const queryParams = qs.stringify(params, { encode: true });
  const url = useBase
    ? `${apiUrlBeta}${path}${queryParams ? `?${queryParams}` : ''}`
    : `${path}${queryParams ? `?${queryParams}` : ''}`;

  const MAX_RETRIES = 3;
  const TIMEOUT = 10000;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const headers = new Headers({
        Authorization: `Bearer ${fetchKey}`,
      });

      const mergedOptions: RequestInit = {
        headers,
        signal: controller.signal,
        ...options,
      };
      const response = await fetch(url, useBase ? mergedOptions : {});
      clearTimeout(timeoutId);

      if (response.status !== 200) {
        throw new Error(`${response.statusText}`);
      }

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('json');
        return isJson ? response.json() : response.text();
      }
    } catch (error: any) {
      clearTimeout(timeoutId);

      console.error(`Error on attempt ${attempt + 1} - ${url}:`, error);

      const delay = Math.pow(2, attempt) * 300;
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (attempt === MAX_RETRIES - 1) {
        return {
          message: 'Error',
          status: 500,
          error,
        };
      }
    }
  }
};

export const postRequest = async (
  path: string,
  body: Record<string, any> = {},
  customHeaders: Record<string, string> = {},
) => {
  const url = `${appUrl}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${fetchKey}`,
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  try {
    const response = await fetch(url, {
      body: JSON.stringify(body),
      headers,
      method: 'POST',
    });

    if (!response.ok) {
      console.error(`Failed to POST to ${url} with status ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error posting to ${url}:`, error);
    throw error;
  }
};
