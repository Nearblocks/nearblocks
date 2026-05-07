import { cache } from 'react';
import 'server-only';

const SPAM_LIST_URL =
  'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json';

type SpamList = { blacklist: string[] };

export const fetchSpamTokens = cache(async (): Promise<string[]> => {
  try {
    const res = await fetch(SPAM_LIST_URL, { next: { revalidate: 3600 } });

    if (!res.ok) return [];

    const data = (await res.json()) as SpamList;

    return data.blacklist ?? [];
  } catch {
    return [];
  }
});
