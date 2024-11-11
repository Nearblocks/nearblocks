import qs from 'qs';
import { appUrl } from './config';

const fetchKey = process.env.API_ACCESS_KEY;
const baseURL = process.env.API_URL;

export const getRequest = async (
  path: string,
  params = {},
  options?: {},
  useBase: boolean = true,
) => {
  const queryParams = qs.stringify(params, { encode: true });
  const url = useBase
    ? `${baseURL}${path}${queryParams ? `?${queryParams}` : ''}`
    : `${path}${queryParams ? `?${queryParams}` : ''}`;

  const headers = new Headers({
    Authorization: `Bearer ${fetchKey}`,
  });

  try {
    const response = await fetch(url, { headers: headers, ...options });

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
    'Content-Type': 'application/json',
    Authorization: `Bearer ${fetchKey}`,
    ...customHeaders,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
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
