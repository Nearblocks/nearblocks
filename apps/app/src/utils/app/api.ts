import qs from 'qs';

import { apiUrl, appUrl } from './config';

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

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const headers = new Headers({
        Authorization: `Bearer ${fetchKey}`,
      });

      const mergedOptions = { headers, ...options };
      const response = await fetch(url, mergedOptions);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('json');
        return isJson ? response.json() : response.text();
      }

      if (response.status !== 200) {
        console.error(
          `Server error on ${url} attempt ${attempt}: ${response.statusText}`,
        );
        if (attempt === MAX_RETRIES - 1) return null;
      }
    } catch (error: any) {
      const isNetworkError =
        error instanceof TypeError || (error as Error).name === 'NetworkError';
      console.error(
        `Error on attempt ${attempt + 1}: ${(error as Error).message}`,
      );

      if (!isNetworkError || attempt + 1 === MAX_RETRIES) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      throw error;
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
