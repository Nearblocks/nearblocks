import { getServerConfig } from '@/lib/config';

export const GET = async (req: Request): Promise<Response> => {
  const { searchParams } = new URL(req.url);
  const account = searchParams.get('account');

  if (!account) {
    return Response.json({ error: 'account required' }, { status: 400 });
  }

  const params = new URLSearchParams();
  const date = searchParams.get('date');
  const block = searchParams.get('block');
  if (date) params.set('date', date);
  if (block) params.set('block', block);

  const config = getServerConfig();
  const res = await fetch(
    `${config.API_URL}/v3/accounts/${encodeURIComponent(
      account,
    )}/balance?${params}`,
    { headers: { Authorization: `Bearer ${config.API_ACCESS_KEY}` } },
  );
  const json = await res.json();
  return Response.json(json, { status: res.status });
};
