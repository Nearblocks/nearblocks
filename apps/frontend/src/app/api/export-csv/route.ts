import { NextResponse } from 'next/server';

import { ExportType } from 'nb-types';

import { getServerConfig } from '@/lib/config';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const ENDPOINTS: Record<ExportType, string> = {
  [ExportType.FT_TRANSFERS]: 'ft-txns/export',
  [ExportType.KEYS]: 'keys/export',
  [ExportType.MT_TRANSFERS]: 'mt-txns/export',
  [ExportType.NFT_TRANSFERS]: 'nft-txns/export',
  [ExportType.RECEIPTS]: 'receipts/export',
  [ExportType.STAKING]: 'staking-txns/export',
  [ExportType.SUBACCOUNTS]: 'subaccounts/export',
  [ExportType.TRANSACTIONS]: 'txns/export',
};

const FILENAMES: Record<ExportType, string> = {
  [ExportType.FT_TRANSFERS]: 'ft-txns.csv',
  [ExportType.KEYS]: 'keys.csv',
  [ExportType.MT_TRANSFERS]: 'mt-txns.csv',
  [ExportType.NFT_TRANSFERS]: 'nft-txns.csv',
  [ExportType.RECEIPTS]: 'receipts.csv',
  [ExportType.STAKING]: 'staking-txns.csv',
  [ExportType.SUBACCOUNTS]: 'subaccounts.csv',
  [ExportType.TRANSACTIONS]: 'txns.csv',
};

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const config = getServerConfig();

  const rawType = searchParams.get('type') ?? '';
  const account = searchParams.get('account') ?? '';
  const filter = searchParams.get('filter') ?? '';
  const token = searchParams.get('token') ?? '';

  const isValidType = (Object.values(ExportType) as string[]).includes(rawType);
  if (!isValidType || !account || !filter || !token) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }
  const type = rawType as ExportType;

  const formData = new URLSearchParams();
  formData.append('secret', config.TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  const verification = await fetch(TURNSTILE_VERIFY_URL, {
    body: formData.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });

  const verificationResult = (await verification.json()) as {
    success: boolean;
  };

  if (!verificationResult.success) {
    return NextResponse.json(
      { error: 'Captcha verification failed' },
      { status: 403 },
    );
  }

  const apiParams = new URLSearchParams();
  apiParams.set('filter', filter);

  if (filter === 'date') {
    const start = searchParams.get('start') ?? '';
    const end = searchParams.get('end') ?? '';
    if (!start || !end) {
      return NextResponse.json(
        { error: 'Missing date params' },
        { status: 400 },
      );
    }
    apiParams.set('start', start);
    apiParams.set('end', end);
  } else if (filter === 'block') {
    const blockStart = searchParams.get('block_start') ?? '';
    const blockEnd = searchParams.get('block_end') ?? '';
    if (!blockStart || !blockEnd) {
      return NextResponse.json(
        { error: 'Missing block params' },
        { status: 400 },
      );
    }
    apiParams.set('block_start', blockStart);
    apiParams.set('block_end', blockEnd);
  } else {
    return NextResponse.json({ error: 'Invalid filter' }, { status: 400 });
  }

  const endpoint = ENDPOINTS[type];
  const filename = FILENAMES[type];
  const encodedAccount = encodeURIComponent(account);
  const upstreamUrl = `${
    config.API_URL
  }/v3/accounts/${encodedAccount}/${endpoint}?${apiParams.toString()}`;

  const upstream = await fetch(upstreamUrl, {
    headers: { Authorization: `Bearer ${config.API_ACCESS_KEY}` },
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: 'Export failed' },
      { status: upstream.status },
    );
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'text/csv',
    },
  });
};
