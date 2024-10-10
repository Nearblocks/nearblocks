import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = process.env.API_ACCESS_KEY;
  const network = process.env.NEXT_PUBLIC_NETWORK_ID;
  const mainnetApiUrl = 'https://api.nearblocks.io/v1';
  const testnetApiUrl = 'https://api-testnet.nearblocks.io/v1';

  const url =
    network === 'mainnet'
      ? `${mainnetApiUrl}/legacy/circulating-supply`
      : `${testnetApiUrl}/legacy/circulating-supply`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch circulating supply data' });
  }
}
