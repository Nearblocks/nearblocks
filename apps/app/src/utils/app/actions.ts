'use server';

import { cookies } from 'next/headers';
import { notFound, redirect, RedirectType } from 'next/navigation';
import { SearchResult, Status, StatusInfo, UserToken } from '../types';
import { getUserDataFromToken } from './libs';
import { getRequest } from './api';
import { revalidateTag } from 'next/cache';
import { getMessages } from 'next-intl/server';
import { providers } from 'near-api-js';
import { getRpcProviders } from './rpc';
interface ExportParams {
  exportType: string;
  id: string;
  startDate: string;
  endDate: string;
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

type SearchResponse = { data: SearchResult; keyword: string } | { data: null };

export async function handleFilterAndKeyword(
  keyword: string,
  filter: string,
): Promise<SearchResponse> {
  'use server';

  try {
    if (keyword.includes('.')) {
      keyword = keyword.toLowerCase();
    }

    const res = await getRequest(`v1/search${filter}?keyword=${keyword}`);
    if (!res) return res;
    const data: SearchResult = {
      accounts: [],
      blocks: [],
      receipts: [],
      txns: [],
      tokens: [],
      mtTokens: [],
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

    if (res?.mtTokens?.length) {
      data.mtTokens = res?.mtTokens;
    }
    const hasValidData = Object.values(data).some(
      (value) => Array.isArray(value) && value.length > 0,
    );
    return hasValidData ? { data, keyword } : { data: null };
  } catch (error) {
    return { data: null };
  }
}

export async function handleExport({
  exportType,
  id,
  startDate,
  endDate,
}: ExportParams) {
  try {
    let url = '';
    let text = '';
    let file = '';

    switch (exportType) {
      case 'transactions':
        url = `v1/account/${id?.toLowerCase()}/txns-only/export?start=${startDate}&end=${endDate}`;
        text = 'Transactions';
        file = `${id}_transactions_${startDate}_${endDate}.csv`;
        break;
      case 'receipts':
        url = `v2/account/${id?.toLowerCase()}/receipts/export?start=${startDate}&end=${endDate}`;
        text = 'Receipts';
        file = `${id}_receipts_${startDate}_${endDate}.csv`;
        break;
      case 'tokentransactions':
        url = `v1/account/${id?.toLowerCase()}/ft-txns/export?start=${startDate}&end=${endDate}`;
        text = 'Token Transactions';
        file = `${id}_ft_transactions_${startDate}_${endDate}.csv`;
        break;
      case 'nfttokentransactions':
        url = `v1/account/${id?.toLowerCase()}/nft-txns/export?start=${startDate}&end=${endDate}`;
        text = 'NFT Token Transactions';
        file = `${id}_nft_transactions_${startDate}_${endDate}.csv`;
        break;
      default:
        throw new Error('Invalid export type');
    }

    const response = await getRequest(
      url,
      {},
      {
        method: 'GET',
        headers: {
          Accept: 'text/csv',
        },
      },
    );
    if (response?.status === 500) {
      throw new Error(response.message || 'Failed to export data');
    }

    const blob =
      response instanceof Blob
        ? response
        : new Blob([response], { type: 'text/csv' });

    return {
      blob,
      filename: file,
      title: text,
    };
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

export const getLatestStats = async (): Promise<StatusInfo> => {
  'use server';
  const statsDetails = await getRequest(`v1/stats`);
  return statsDetails?.stats?.[0];
};

export const getSyncStatus = async (): Promise<Status> => {
  'use server';
  const sync = await getRequest('v1/sync/status');
  const syncStatus = sync?.status;
  return syncStatus;
};

export const revalidateTxn = async (hash: string) => {
  revalidateTag(`txn-${hash}`);
};
export const getMessage = async (): Promise<any> => {
  'use server';
  const messages = await getMessages();
  return messages;
};

export async function getSeatInfo(rpcUrl: string) {
  const newProvider = new providers.JsonRpcProvider({ url: rpcUrl });
  const currentEpochSeatPrice = await newProvider?.getCurrentEpochSeatPrice();
  const nextEpochSeatPrice = await newProvider?.getNextEpochSeatPrice();
  const protocolConfig = await newProvider.experimental_protocolConfig({
    finality: 'final',
  });

  return {
    currentEpochSeatPrice,
    nextEpochSeatPrice,
    protocolConfig,
  };
}
const RpcProviders = await getRpcProviders();
const jsonProviders = RpcProviders.map(
  (p) => new providers.JsonRpcProvider({ url: p.url }, { retries: 0 }),
);
const provider = new providers.FailoverRpcProvider(jsonProviders);
export const contractCode = async (address: string) => {
  const contractCode = await provider.query({
    request_type: 'view_code',
    finality: 'final',
    account_id: address.toLowerCase(),
  });
  return contractCode;
};
export const viewAccessKeys = async (address: string) => {
  const viewAccessKeys = await provider.query({
    request_type: 'view_access_key_list',
    finality: 'final',
    account_id: address.toLowerCase(),
  });
  return viewAccessKeys;
};
export const viewAccount = async (accountId: string) => {
  const viewAccount = await provider.query({
    request_type: 'view_account',
    finality: 'final',
    account_id: accountId.toLowerCase(),
  });
  return viewAccount;
};
