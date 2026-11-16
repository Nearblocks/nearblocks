import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

import accountsAssets from 'nb-schemas/dist/accounts/assets/response.js';
import accountsFts from 'nb-schemas/dist/accounts/fts/response.js';
import accountsKeys from 'nb-schemas/dist/accounts/keys/response.js';
import accountsMts from 'nb-schemas/dist/accounts/mts/response.js';
import accountsNfts from 'nb-schemas/dist/accounts/nfts/response.js';
import accountsReceipts from 'nb-schemas/dist/accounts/receipts/response.js';
import accounts from 'nb-schemas/dist/accounts/response.js';
import accountsStaking from 'nb-schemas/dist/accounts/staking/response.js';
import accountsStats from 'nb-schemas/dist/accounts/stats/response.js';
import accountsSubaccounts from 'nb-schemas/dist/accounts/subaccounts/response.js';
import accountsTxns from 'nb-schemas/dist/accounts/txns/response.js';
import blocks from 'nb-schemas/dist/blocks/response.js';
import fts from 'nb-schemas/dist/fts/response.js';
import ftsStats from 'nb-schemas/dist/fts/stats/response.js';
import intents from 'nb-schemas/dist/intents/response.js';
import keys from 'nb-schemas/dist/keys/response.js';
import kitwallet from 'nb-schemas/dist/kitwallet/response.js';
import mts from 'nb-schemas/dist/mts/response.js';
import mtsStats from 'nb-schemas/dist/mts/stats/response.js';
import mtsTokens from 'nb-schemas/dist/mts/tokens/response.js';
import multichain from 'nb-schemas/dist/multichain/response.js';
import nfts from 'nb-schemas/dist/nfts/response.js';
import nftsTokens from 'nb-schemas/dist/nfts/tokens/response.js';
import receipts from 'nb-schemas/dist/receipts/response.js';
import search from 'nb-schemas/dist/search/response.js';
import stakingRes from 'nb-schemas/dist/staking/response.js';
import stats from 'nb-schemas/dist/stats/response.js';
import sync from 'nb-schemas/dist/sync/response.js';
import txns from 'nb-schemas/dist/txns/response.js';
import validators from 'nb-schemas/dist/validators/response.js';

import { contextFor, exampleFor, paramExample } from '#libs/apiDocs/examples';

type AnySchema = v.GenericSchema;
type Json = Record<string, unknown>;

// Route docs reference `#/components/responses/<module>.<key>`, e.g.
// `accounts.txns.count` is `count` in nb-schemas/src/accounts/txns/response.ts.
const MODULES: Record<string, Record<string, AnySchema>> = {
  accounts,
  'accounts/assets': accountsAssets,
  'accounts/fts': accountsFts,
  'accounts/keys': accountsKeys,
  'accounts/mts': accountsMts,
  'accounts/nfts': accountsNfts,
  'accounts/receipts': accountsReceipts,
  'accounts/staking': accountsStaking,
  'accounts/stats': accountsStats,
  'accounts/subaccounts': accountsSubaccounts,
  'accounts/txns': accountsTxns,
  blocks,
  fts,
  'fts/stats': ftsStats,
  intents,
  keys,
  kitwallet,
  mts,
  'mts/stats': mtsStats,
  'mts/tokens': mtsTokens,
  multichain,
  nfts,
  'nfts/tokens': nftsTokens,
  receipts,
  search,
  staking: stakingRes,
  stats,
  sync,
  txns,
  validators,
};

const REF_PREFIX = '#/components/responses/';

const resolveSchema = (name: string) => {
  const dot = name.lastIndexOf('.');
  const schema =
    MODULES[name.slice(0, dot).replace(/\./g, '/')]?.[name.slice(dot + 1)];

  if (!schema) throw new Error(`API docs: unknown response schema "${name}"`);

  return schema;
};

// Only paginated (list) responses carry cursors.
const withoutStrayMeta = (example: unknown) => {
  if (!example || typeof example !== 'object' || Array.isArray(example)) {
    return example;
  }
  const { meta, ...rest } = example as Json;

  return Array.isArray(rest.data) ? { ...rest, meta } : rest;
};

const buildResponse = (name: string, apiPath: string) => {
  const schema = toJsonSchema(resolveSchema(name), {
    errorMode: 'ignore',
  }) as Json;
  const { $schema: _, ...jsonSchema } = schema;
  const example = exampleFor(jsonSchema, '', contextFor(apiPath));

  return {
    content: {
      'application/json': {
        example: withoutStrayMeta(example),
        schema: jsonSchema,
      },
    },
    description: 'Success response',
  };
};

const errorResponse = (description: string, example: Json) => ({
  content: { 'application/json': { example } },
  description,
});

const ERROR_RESPONSES = {
  '422': { $ref: `${REF_PREFIX}ValidationError` },
  '429': { $ref: `${REF_PREFIX}RateLimited` },
};

const withParamExamples = (params: Json[], apiPath: string) =>
  params.map((param) => {
    const schema = (param.schema ?? {}) as Json;
    const example = paramExample(String(param.name), apiPath);

    return example === undefined || 'example' in param || 'example' in schema
      ? param
      : { ...param, example };
  });

/**
 * Fills in response schemas + examples for every `$ref` to
 * `#/components/responses/*`, and request parameter examples. Returns a new
 * spec; throws at startup if a route references an unknown schema.
 */
export const withResponses = (spec: Json) => {
  const paths = spec.paths as Record<string, Record<string, Json>>;
  const responses: Record<string, unknown> = {
    RateLimited: errorResponse('Rate limit exceeded for your plan', {
      message:
        'You have exceeded your API request limit. Please try again later or upgrade your plan for higher limits at https://nearblocks.io/apis.',
    }),
    ValidationError: errorResponse('Invalid path or query parameter', {
      data: null,
      errors: [{ message: 'Invalid type: Expected number', path: 'limit' }],
    }),
  };

  const newPaths = Object.fromEntries(
    Object.entries(paths).map(([apiPath, ops]) => [
      apiPath,
      Object.fromEntries(
        Object.entries(ops).map(([method, op]) => {
          const opResponses = (op.responses ?? {}) as Record<string, Json>;
          const ref = opResponses['200']?.$ref;

          if (typeof ref === 'string' && ref.startsWith(REF_PREFIX)) {
            const name = ref.slice(REF_PREFIX.length);
            responses[name] ??= buildResponse(name, apiPath);
          }

          return [
            method,
            {
              ...op,
              ...(op.parameters
                ? {
                    parameters: withParamExamples(
                      op.parameters as Json[],
                      apiPath,
                    ),
                  }
                : {}),
              responses: op['x-internal']
                ? opResponses
                : { ...opResponses, ...ERROR_RESPONSES },
            },
          ];
        }),
      ),
    ]),
  );

  const components = (spec.components ?? {}) as Json;

  return {
    ...spec,
    components: { ...components, responses },
    paths: newPaths,
  };
};
