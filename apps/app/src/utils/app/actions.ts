'use server';

import { cookies } from 'next/headers';
import { notFound, redirect, RedirectType } from 'next/navigation';
import { UserToken } from '../types';
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

export async function handleFilterAndKeyword(
  keyword: string,
  filter: string,
  returnPath: boolean,
) {
  'use server';

  try {
    if (keyword.includes('.')) {
      keyword = keyword.toLowerCase();
    }

    const res = await getRequest(`search${filter}?keyword=${keyword}`);
    if (!res) return res;
    const data = {
      accounts: [],
      blocks: [],
      receipts: [],
      txns: [],
      tokens: [],
    };

    if (res?.blocks?.length) {
      if (returnPath) {
        return { path: res.blocks[0].block_hash, type: 'block' };
      }
      data.blocks = res.blocks;
    }

    if (res?.txns?.length) {
      if (returnPath) {
        return { path: res.txns[0].transaction_hash, type: 'txn' };
      }
      data.txns = res.txns;
    }

    if (res?.receipts?.length) {
      if (returnPath) {
        return {
          path: res.receipts[0].originated_from_transaction_hash,
          type: 'txn',
        };
      }
      data.receipts = res.receipts;
    }

    if (res?.accounts?.length) {
      if (returnPath) {
        return { path: res.accounts[0].account_id, type: 'address' };
      }
      data.accounts = res.accounts;
    }

    if (res?.tokens?.length) {
      if (returnPath) {
        return { path: res.tokens[0].contract, type: 'token' };
      }
      data.tokens = res.tokens;
    }
    return returnPath ? null : data;
  } catch (error) {
    return null;
  }
}
