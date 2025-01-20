const baseURL = process.env.API_URL;
const accessKey = process.env.API_ACCESS_KEY;

const fetcher = async (url: string, options = {} as any) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${baseURL}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${accessKey}`,
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error({ error });
    if (error.name === 'AbortError') {
      console.error('Fetch request timed out');
    } else {
      console.error('Fetch error:', error);
    }
    throw error;
  }
};

export default fetcher;
