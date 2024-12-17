'use server';

import { cookies } from 'next/headers';

export async function setCurrentTheme(theme: string) {
  const cookieStore = await cookies();
  cookieStore.set('theme', theme, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });
}
