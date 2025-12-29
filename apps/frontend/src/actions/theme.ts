'use server';

import { cookies } from 'next/headers';

import { Theme } from '@/types/enums';

export const getTheme = async () => {
  const cookieStore = await cookies();

  return cookieStore.get('theme') ?? 'light';
};

export const setTheme = async (theme: Theme = 'light') => {
  const cookieStore = await cookies();

  cookieStore.set('theme', theme);
};
