import { NextRequest, NextResponse } from 'next/server';

import { ContactFormData, submitContact } from '@/utils/app/contact';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactFormData;
    const result = await submitContact(body);

    if (!result.success) {
      return NextResponse.json(
        { err: result.error, status: 0 },
        { status: result.statusCode },
      );
    }

    return NextResponse.json(
      { message: result.data?.message, status: 1 },
      { status: result.statusCode },
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      {
        detail:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
        err: 'An unexpected error occurred',
        status: 0,
      },
      { status: 500 },
    );
  }
}
