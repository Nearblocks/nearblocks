import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
