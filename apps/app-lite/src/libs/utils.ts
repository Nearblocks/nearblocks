const ACCOUNT_ID_REGEX =
  /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;

export const isValidAccount = (accountId: string) => {
  return (
    accountId.length >= 2 &&
    accountId.length <= 64 &&
    ACCOUNT_ID_REGEX.test(accountId)
  );
};

const BASE58_HASH_REGEX = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;
const DIGITS_REGEX = /^\d+$/;

export const MIN_SEARCH_LENGTH = 2;
const MAX_BLOCK_HEIGHT_DIGITS = 12;

export const classifyQuery = (query: string) => {
  const lower = query.toLowerCase();

  if (DIGITS_REGEX.test(query)) {
    return {
      account: isValidAccount(query) ? query : undefined,
      block:
        query.length <= MAX_BLOCK_HEIGHT_DIGITS ? Number(query) : undefined,
      txn: undefined,
    };
  }

  if (BASE58_HASH_REGEX.test(query) && /[A-Z]/.test(query)) {
    return { account: undefined, block: query, txn: query };
  }

  return {
    account: isValidAccount(lower) ? lower : undefined,
    block: undefined,
    txn: undefined,
  };
};

export const shortenHash = (hash: string) =>
  `${hash && hash.slice(0, 6)}...${hash.slice(-4)}`;

export const shortenAddress = (address: string) => {
  const string = String(address);

  if (string.length <= 20) return string;

  return `${string.slice(0, 10)}...${string.slice(-7)}`;
};

export const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);

    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};
