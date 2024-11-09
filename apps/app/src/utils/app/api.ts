import qs from 'qs';

import { appUrl } from './config';

const fetchKey = process.env.API_ACCESS_KEY;
const baseURL = process.env.API_URL;

export const getRequest = async (
  path: string,
  params = {},
  customHeaders: Record<string, string> = {},
  useBase: boolean = true,
) => {
  const queryParams = qs.stringify(params, { encode: true });
  const url = useBase
    ? `${baseURL}${path}${queryParams ? `?${queryParams}` : ''}`
    : `${path}${queryParams ? `?${queryParams}` : ''}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${fetchKey}`,
    ...customHeaders,
  };

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
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
