import qs from 'qs';
import { apiUrl } from './config';

const fetchKey = process.env.API_ACCESS_KEY;

const MAX_RETRIES = 3;
const TIMEOUT = 10000;

export const getRequest = async (
  path: string,
  params: Record<string, any> = {},
  options: RequestInit = {},
  useBase: boolean = true,
): Promise<any> => {
  if (!fetchKey) throw new Error('Fetch key is not provided');

  const query = qs.stringify(params, { encode: true });
  const url = useBase
    ? `${apiUrl}${path}${query ? `?${query}` : ''}`
    : `${path}${query ? `?${query}` : ''}`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const headers = {
        Authorization: `Bearer ${fetchKey}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get('Retry-After') || '1',
          10,
        );
        console.warn(`Rate limited. Retrying after ${retryAfter} seconds.`);
        await new Promise((res) => setTimeout(res, retryAfter * 1000));
        continue;
      }

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      return contentType?.includes('json')
        ? await response.json()
        : await response.text();
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(`Error on attempt ${attempt + 1} - ${url}:`, err);

      if (attempt === MAX_RETRIES - 1) {
        return {
          message: 'Request failed after retries',
          status: 500,
          error: err instanceof Error ? err.message : err,
        };
      }

      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 300),
      );
    }
  }
};
