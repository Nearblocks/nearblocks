// Mock values for the API docs. Response examples are generated from each
// endpoint's JSON schema, picking a value by field name (see `stringFor`).

type Schema = {
  [key: string]: unknown;
  anyOf?: Schema[];
  const?: unknown;
  default?: unknown;
  enum?: unknown[];
  items?: Schema;
  properties?: Record<string, Schema>;
  type?: string | string[];
};

export const EXAMPLE = {
  account: 'alice.near',
  blockHash: 'GNiXZgf1R3wQ8pVsWvT2cYbH9jK4mLnE6aD7oPqRsTuV',
  blockHeight: '137845210',
  codeHash: '6x4vBqGhJ3kM8nP2rS5tW9yZ1aC7dE4fH6jK8mN3pQ5r',
  cursor: 'eyJ0cyI6IjE3NjMyNTEyMDAwMDAwMDAwMDAiLCJpZCI6IjEyMyJ9',
  date: '2026-11-15',
  ftContract: 'wrap.near',
  mtContract: 'intents.near',
  mtToken: 'nep141:wrap.near',
  nftContract: 'x.paras.near',
  nftToken: '1337',
  publicKey: 'ed25519:6E8sCci9badyRkXb3JoRpBj5p8C6Tw41ELDZoiihKEtp',
  receiptId: '8kRw2xHq5vT9mNcL3jF7pYbD4sA6gE1uK2oZ9iX5wQ7e',
  receiver: 'bob.near',
  timestamp: '1763251200000000000',
  txnHash: 'BkqVZSJbsJPDxmz8ozYvgMaxkYNM8zdBiJvSpKJ3oyBv',
  validator: 'astro-stakers.poolv1.near',
  yocto: '1000000000000000000000000', // 1 NEAR
} as const;

// Contract/token examples depend on which token standard the endpoint serves.
export type ExampleContext = 'ft' | 'mt' | 'nft';

const tokenFor = (ctx?: ExampleContext) =>
  ctx === 'mt' ? EXAMPLE.mtToken : EXAMPLE.nftToken;

const contractFor = (ctx?: ExampleContext) =>
  ctx === 'nft'
    ? EXAMPLE.nftContract
    : ctx === 'mt'
      ? EXAMPLE.mtContract
      : EXAMPLE.ftContract;

const STRING_RULES: [RegExp, (ctx?: ExampleContext) => string][] = [
  [/^(next|prev)_page$/, () => EXAMPLE.cursor],
  [/^(transaction_hash|txn_hash|dest_txn|rlp_hash)$/, () => EXAMPLE.txnHash],
  [/^(receipt_id)$/, () => EXAMPLE.receiptId],
  [/block_hash$/, () => EXAMPLE.blockHash],
  [/(code_hash|reference_hash|image_hash)$/, () => EXAMPLE.codeHash],
  [/(block_height|_height)$/, () => EXAMPLE.blockHeight],
  [/(timestamp|Timestamp|_at)$/, () => EXAMPLE.timestamp],
  [/^(date|first_day|last_day|start|end)$/, () => EXAMPLE.date],
  [/^public_key$/, () => EXAMPLE.publicKey],
  [/^permission_kind$/, () => 'FULL_ACCESS'],
  [/^staking_status$/, () => 'active'],
  [/^stake_change_symbol$/, () => '+'],
  [/^hex_address$/, () => '0x5c09a3b1b2f0a2c4e8d4d2f3c41a7b2e9d8f0a11'],
  [/^dest_address$/, () => 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'],
  [/^code_base64$/, () => 'AGFzbQEAAAA='],
  [/^avg_block_time$/, () => '1.1'],
  [/^(author|author_account_id|validator_id)$/, () => EXAMPLE.validator],
  [/^(receiver_account_id|affected_account_id)$/, () => EXAMPLE.receiver],
  [/^token$/, (ctx) => (ctx === 'ft' ? EXAMPLE.ftContract : tokenFor(ctx))],
  [/^(contract|contract_account_id)$/, contractFor],
  [/^coingecko_id$/, () => 'wrapped-near'],
  [/^coinmarketcap_id$/, () => '6993'],
  [/^token_id$/, tokenFor],
  [/(account_id|^account|^owner|^signer)$/, () => EXAMPLE.account],
  [/^gas_price$/, () => '100000000'],
  [/(^|_)gas(_|$)/, () => '2428055156258'],
  [/(near_btc_price)$/, () => '0.00003512'],
  [/(market_cap|volume|tvl)/, () => '125000000.5'],
  [/(change_24h|apy)/, () => '1.85'],
  [/(price|_usd)/, () => '3.25'],
  [/(percent)$/, () => '1.25'],
  [
    /(amount|deposit|stake|supply|burnt|fee|balance|seat_price)/,
    () => EXAMPLE.yocto,
  ],
  [/^symbol$/, (ctx) => (ctx === 'nft' ? 'PARAS' : 'wNEAR')],
  [
    /^name$/,
    (ctx) =>
      ctx === 'nft' ? 'Paras Collectibles' : 'Wrapped NEAR fungible token',
  ],
  [/^(title)$/, () => 'Genesis #1337'],
  [/^(description)$/, () => 'Example description'],
  [/^(icon|logo)$/, () => 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='],
  [/^(media|base_uri|url|website|reference)$/, () => 'https://example.com'],
  [
    /^(twitter|facebook|reddit|telegram|discord|github)$/,
    () => 'https://example.com',
  ],
  [/^email$/, () => 'hello@example.com'],
  [/^method$/, () => 'ft_transfer'],
  [/^(version|spec)$/, () => '1.0.0'],
  [/^(blockchain|dest_chain)$/, () => 'near'],
  [/^(city)$/, () => 'Singapore'],
  [/^country_code$/, () => 'SG'],
  [/^country$/, () => 'Singapore'],
  [/^(message)$/, () => 'Example message'],
  // Remaining strings are mostly counts and totals serialised as strings.
  [/./, () => '1250'],
];

const stringFor = (key: string, ctx?: ExampleContext) =>
  STRING_RULES.find(([re]) => re.test(key))?.[1](ctx) ?? 'string';

const NUMBER_RULES: [RegExp, number][] = [
  [/^decimals$/, 24],
  [/^(shard|shard_id|index_in_chunk|event_index|event_type)$/, 0],
  [/^copies$/, 1],
  [/(percent|apy|tps)$/, 12.5],
];

const numberFor = (key: string) =>
  NUMBER_RULES.find(([re]) => re.test(key))?.[1] ?? 1250;

const ARGS_EXAMPLE = { amount: EXAMPLE.yocto, receiver_id: EXAMPLE.receiver };

// Enum values that read naturally next to the other mock values.
const PREFERRED = new Set<unknown>([
  'FUNCTION_CALL',
  'SUCCESS',
  'SUCCESS_VALUE',
  'TRANSFER',
]);
// Fields that are normally null/empty (e.g. a live account's `deleted`).
// Non-nullable objects among them keep only their required fields.
const NULL_KEYS = new Set(['deleted', 'extra', 'mpc', 'rlp_hash']);

// Mixed responses (search) nest each token standard under its own key.
const KEY_CONTEXT: Record<string, ExampleContext> = {
  fts: 'ft',
  mts: 'mt',
  nfts: 'nft',
};

const typeOf = (schema: Schema) =>
  Array.isArray(schema.type)
    ? schema.type.find((t) => t !== 'null')
    : schema.type;

export const exampleFor = (
  schema: Schema | undefined,
  key = '',
  ctx?: ExampleContext,
): unknown => {
  if (!schema) return null;
  if (schema.const !== undefined) return schema.const;
  if (schema.enum?.length) {
    return schema.enum.find((e) => PREFERRED.has(e)) ?? schema.enum[0];
  }
  if (schema.anyOf?.length) {
    const nonNull = schema.anyOf.find((s) => s.type !== 'null');
    return nonNull && !NULL_KEYS.has(key)
      ? exampleFor(nonNull, key, ctx)
      : null;
  }

  switch (typeOf(schema)) {
    case 'array':
      // Untyped items are recursive schemas (e.g. nested receipts).
      return schema.items?.type || schema.items?.anyOf
        ? [exampleFor(schema.items, key, ctx)]
        : [];
    case 'boolean':
      return key !== 'locked' && !key.startsWith('is_network');
    case 'integer':
    case 'number':
      return numberFor(key);
    case 'object': {
      const required = (schema.required ?? []) as string[];

      return Object.fromEntries(
        Object.entries(schema.properties ?? {})
          .filter(([k]) => k !== 'errors')
          .filter(([k]) => !NULL_KEYS.has(key) || required.includes(k))
          .map(([k, s]) => [k, exampleFor(s, k, KEY_CONTEXT[k] ?? ctx)]),
      );
    }
    case 'string':
      return stringFor(key, ctx);
    default:
      // Untyped JSON (e.g. function call args).
      return key === 'args' ? ARGS_EXAMPLE : {};
  }
};

// Request parameter examples, by name and (where it matters) by path.
export const paramExample = (name: string, apiPath: string) => {
  const ctx = contextFor(apiPath);

  switch (name) {
    case 'account':
    case 'affected':
    case 'involved':
    case 'predecessor':
    case 'signer':
      return EXAMPLE.account;
    case 'receiver':
      return EXAMPLE.receiver;
    case 'contract':
      return contractFor(ctx);
    case 'token':
      return ctx === 'mt' || apiPath.includes('/mt-')
        ? EXAMPLE.mtToken
        : EXAMPLE.nftToken;
    case 'hash':
      return apiPath.startsWith('/v3/blocks')
        ? EXAMPLE.blockHash
        : apiPath.startsWith('/v3/receipts')
          ? EXAMPLE.receiptId
          : EXAMPLE.txnHash;
    case 'txn':
      return EXAMPLE.txnHash;
    case 'key':
      return EXAMPLE.publicKey;
    case 'block':
      return EXAMPLE.blockHeight;
    case 'keyword':
      return 'wrap.near';
    case 'date':
      return EXAMPLE.date;
    case 'before_ts':
    case 'fromBlockTimestamp':
      return EXAMPLE.timestamp;
    case 'method':
      return 'ft_transfer';
    case 'search':
      return 'wrap';
    default:
      return undefined;
  }
};

export const contextFor = (apiPath: string): ExampleContext | undefined => {
  if (/^\/v3\/(nfts|accounts\/[^/]+\/(nft|assets\/nft))/.test(apiPath)) {
    return 'nft';
  }
  if (/^\/v3\/(mts|intents|accounts\/[^/]+\/(mt|assets\/mt))/.test(apiPath)) {
    return 'mt';
  }
  return 'ft';
};
