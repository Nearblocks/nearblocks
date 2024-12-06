import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { status: 'NearBlocks is healthy' },
    { status: 200 },
  );
}
