'use server';

import qs from 'qs';

const fetchKey = process.env.API_ACCESS_KEY;
const baseURL = process.env.API_URL;

export async function makeApiRequest(path: string, params = {}) {
  try {
    const queryParams = qs.stringify(params, { encode: true });
    const url = `${baseURL}${path}${queryParams ? `?${queryParams}` : ''}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${fetchKey}`,
    };
    if (url) {
      const response = await fetch(url.toString(), { headers });
      if (!response.ok) {
        return null;
      }
      return response.json();
    } else {
      throw new Error('URL is not defined.');
    }
  } catch (error: any) {
    throw new Error(`request error: ${error.status}`);
  }
}
