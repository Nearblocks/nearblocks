import qs from 'qs';

const fetchKey = process.env.API_ACCESS_KEY;
const baseURL = process.env.API_URL;

export const getRequest = async (
  path: string,
  params = {},
  customHeaders: Record<string, string> = {},
) => {
  const queryParams = qs.stringify(params, { encode: true });
  const url = `${baseURL}${path}${queryParams ? `?${queryParams}` : ''}`;

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
