'use server';

import { cookies } from 'next/headers';
import { notFound, redirect, RedirectType } from 'next/navigation';
import { UserToken } from '../types';
import { getUserDataFromToken } from './libs';

export async function setCurrentTheme(theme: string) {
  const cookieStore = await cookies();
  cookieStore.set('theme', theme, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });
}

export async function setCookie(name: string, value: string) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    maxAge: 60 * 60,
  });
}

export async function deleteCookie(name: string) {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}

export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

export async function signOut() {
  await deleteCookie('token');
  await deleteCookie('stripe-plan-id');
  await deleteCookie('interval');
  redirect('/login', RedirectType.replace);
}

export async function getUserRole(userRole?: 'publisher' | 'advertiser') {
  const token = await getCookie('token');
  const userData: UserToken | null = getUserDataFromToken(token);
  const role = userData?.role;
  if (!role) redirect('/login');
  if (userRole) {
    if (userRole === role) {
      notFound();
    }
  }
  return role;
}
