import type { NextApiRequest, NextApiResponse } from 'next';

import { getNetworkId } from '@/utils/config';

const API_URLS = {
  mainnet: 'https://api3.nearblocks.io/v3',
  testnet: 'https://api3-testnet.nearblocks.io/v3',
} as const;

const NS_PER_MS = BigInt(1_000_000);

// Same response shape as the retired v1 /legacy/circulating-supply.
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  const apiKey = process.env.API_ACCESS_KEY;

  try {
    const response = await fetch(`${API_URLS[getNetworkId()]}/stats`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`stats request failed: ${response.status}`);
    }

    const { data } = await response.json();

    if (!data?.total_supply) throw new Error('stats missing total_supply');

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    res.status(200).json({
      circulating_supply_in_yoctonear: data.total_supply,
      timestamp: (BigInt(startOfDay.getTime()) * NS_PER_MS).toString(),
    });
  } catch (error) {
    console.error('circulating-supply', error);
    res.status(500).json({ error: 'Failed to fetch circulating supply data' });
  }
}
