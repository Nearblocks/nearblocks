'use server';

import { cookies } from 'next/headers';

export async function setTheme(theme: string) {
  const cookieStore = await cookies();
  cookieStore.set('theme', theme);
}
