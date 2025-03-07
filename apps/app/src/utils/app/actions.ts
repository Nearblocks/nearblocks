'use server';

import { cookies } from 'next/headers';
import { notFound, redirect, RedirectType } from 'next/navigation';
import { SearchResult, UserToken } from '../types';
import { getUserDataFromToken } from './libs';
import { getRequest } from './api';

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

export async function handleFilterAndKeyword(keyword: string, filter: string) {
  'use server';

  try {
    if (keyword.includes('.')) {
      keyword = keyword.toLowerCase();
    }

    const res = await getRequest(`search${filter}?keyword=${keyword}`);
    if (!res) return res;
    const data: SearchResult = {
      accounts: [],
      blocks: [],
      receipts: [],
      txns: [],
      tokens: [],
    };

    if (res?.blocks?.length) {
      data.blocks = res.blocks;
    }

    if (res?.txns?.length) {
      data.txns = res.txns;
    }

    if (res?.receipts?.length) {
      data.receipts = res.receipts;
    }

    if (res?.accounts?.length) {
      data.accounts = res.accounts;
    }

    if (res?.tokens?.length) {
      data.tokens = res.tokens;
    }
    return data;
  } catch (error) {
    return null;
  }
}
