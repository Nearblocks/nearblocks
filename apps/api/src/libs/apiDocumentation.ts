import { readFileSync } from 'fs';
import path from 'path';

import { apiReference } from '@scalar/express-api-reference';
import { Application, Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';

import { Network } from 'nb-types';

import config from '#config';
import { withResponses } from '#libs/apiDocs/responses';

const scalarCss = `
  .light-mode .introduction-section {
    background: url(https://nearblocks.io/images/nearblocksblack.svg) no-repeat;
    background-size: auto;
    padding-top: 60px;
    margin-top: 12px;
  }
  .dark-mode .introduction-section {
    background: url(https://nearblocks.io/images/nearblocksblack_dark.svg) no-repeat;
    background-size: auto;
    padding-top: 60px;
    margin-top: 12px;
  }
`;

const scalarMeta = {
  description:
    'NearBlocks REST API documentation for the NEAR Protocol. Provides endpoints to access blockchain data and integrate seamlessly with NEAR.',
  ogDescription:
    'NearBlocks REST API documentation for the NEAR Protocol. Provides endpoints to access blockchain data and integrate seamlessly with NEAR.',
  ogTitle: 'Near(Ⓝ) REST API | NearBlocks',
  title: 'Near(Ⓝ) REST API | NearBlocks',
  twitterDescription:
    'NearBlocks REST API documentation for the NEAR Protocol. Provides endpoints to access blockchain data and integrate seamlessly with NEAR.',
  twitterTitle: 'Near(Ⓝ) REST API | NearBlocks',
};

// Pinned: the unpinned default URL is poorly cached by the CDN (~5 MB).
const SCALAR_CDN =
  'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.76.4/dist/browser/standalone.js';

const DOCS_CACHE_CONTROL = 'public, max-age=300, s-maxage=3600';

const servers = [
  { description: 'Mainnet', url: config.mainnetUrl },
  { description: 'Testnet', url: config.testnetUrl },
];

const apiDocumentation = async (app: Application, dir: string) => {
  const legacyDescription = `<p><strong>Deprecated. v1 and v2 will be switched off on 22 November 2026; testnet already runs v3 only.</strong></p>
        <p>For new integrations, use the <a href="/api-docs">current API</a>. See the <a href="/api-docs/migration">v1/v2 → v3 migration guide</a> to move existing integrations.</p>
        `;

  // ── Main API docs (v3 only) ───────────────────────────────────────
  const mainOptions = {
    apis: [path.join(dir, 'routes/v3/**/*.{ts,js}')],
    definition: {
      components: {
        securitySchemes: {
          BearerAuth: {
            scheme: 'bearer',
            type: 'http',
          },
        },
      },
      info: {
        description: `<blockquote><p><strong>Migrating from v1 or v2?</strong> v3 changes pagination, response envelopes, and several endpoints — it is not a drop-in base-path swap. Read the <a href="/api-docs/migration">v1/v2 → v3 migration guide</a> (also as <a href="/api-docs/migration.md">Markdown</a> for tools and AI assistants).</p></blockquote>
        <p>NearBlocks provides REST APIs for accessing NEAR Protocol blockchain data. Our APIs enable developers to retrieve account information, analyze smart contracts, and track transactions. You can access the REST APIs using cURL or any HTTP client. We support GET requests only.</p>
        <h2>Attribution Requirements</h2>
        <p>The APIs are offered as a community service and are provided without any warranty. Please use them responsibly and only for what you need.</p>
        <p>For any usage other than personal or private, attribution is required. This can be done by either:</p>
        <ul>
        <li>Including a link back to Nearblocks.io, or</li>
        <li>Mentioning that your app is &quot;Powered by Nearblocks.io APIs.&quot;</li>
        </ul>
        <p>NearBlocks provides subscription-based API plans that provide higher rate limits for power users and commercial solutions. To upgrade to a paid API Plan, head over to the <a href="https://nearblocks.io/apis">APIs</a> page and select a plan that suits your needs. Once payment has been made, you can create API keys to make requests to our endpoints.</p>
        <h2>Resources</h2>
        <ul>
          <li><a href="https://nearblocks.io/">Near Protocol Explorer</a></li>
          <li><a href="https://nearblocks.io/apis">API Plans</a></li>
          <li><a href="https://near.org">Near</a></li>
        </ul>
        <h2>Contact Us</h2>
        <ul>
          <li><a href="https://nearblocks.io/contact">NearBlocks Support</a></li>
        </ul>
        <h2>Authentication</h2>
        <p>Include your API key in requests using the <code>Authorization</code> header with the following format:</p>
        <p>Replace API_KEY with the key string of your API key.</p>
        <p>For example, to pass an API key for an Account API:</p>
        <pre><code> curl -X GET -H "Authorization: Bearer API_KEY" "${
          config.network === Network.MAINNET
            ? config.mainnetUrl
            : config.testnetUrl
        }/v3/accounts/wrap.near"</code></pre>
        <h2>Credits</h2>
        <p>Each request uses 1 credit per 25 items requested with <code>limit</code>, rounded up, from 1 up to 10 credits. For example, <code>limit=50</code> uses 2 credits and <code>limit=100</code> uses 4. Validator endpoints always use 1 credit.</p>
        <h2>Legacy API</h2>
        <p>Documentation for deprecated v1/v2 endpoints is available at <a href="/api-docs/legacy">/api-docs/legacy</a>. They will be switched off on 22 November 2026. To port an existing v1/v2 integration, follow the <a href="/api-docs/migration">migration guide</a>.</p>
        `,
        title: ' ',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      servers,
      tags: [
        {
          description:
            'Retrieve account details, balances, contract metadata, access keys, and token holdings.',
          name: 'Accounts',
        },
        {
          description:
            'List and filter account transactions, token transfers, receipts, and staking activity.',
          name: 'Account Transactions',
        },
        {
          description:
            'Account-level analytics including transaction heatmaps, balance history, and token statistics.',
          name: 'Account Stats',
        },
        {
          description:
            'Query blocks by hash or height, list recent blocks, and retrieve 24-hour block production statistics.',
          name: 'Blocks',
        },
        {
          description:
            'Look up fungible token contracts, list top tokens, and paginate through transfer history and holder data.',
          name: 'FTs',
        },
        {
          description:
            'Look up account information associated with a public access key.',
          name: 'Keys',
        },
        {
          description:
            'Query chain-signature multichain transactions and daily signing statistics.',
          name: 'Multichain',
        },
        {
          description:
            'Look up NFT contracts and individual tokens, list top collections, and paginate through transfer history and holder data.',
          name: 'NFTs',
        },
        {
          description:
            'Search across transactions, blocks, accounts, receipts, and tokens by hash, height, ID, or address.',
          name: 'Search',
        },
        {
          description:
            'Network-wide statistics including supply, gas usage, active accounts, and daily aggregates.',
          name: 'Stats',
        },
        {
          description:
            'List and filter transactions, retrieve transaction details with receipts, and inspect associated token events.',
          name: 'Txns',
        },
        {
          description:
            'Look up multi-token (NEP-245) contracts such as intents.near, list tokens, and paginate through transfer history and holder data.',
          name: 'MTs',
        },
        {
          description:
            'NEAR Intents swap history, volume, and per-asset, per-blockchain, and per-account statistics.',
          name: 'Intents',
        },
        {
          description: 'List receipts and look up individual receipts.',
          name: 'Receipts',
        },
        {
          description:
            'Network-wide staking deposits, withdrawals, and pool activity.',
          name: 'Staking',
        },
        {
          description:
            'Current validators, their stake, uptime, and produced blocks and chunks.',
          name: 'Validators',
        },
        {
          description:
            'Wallet helper endpoints: staking pools, deposits, accounts by public key, and token/NFT holdings.',
          name: 'Kitwallet',
        },
      ],
      'x-tagGroups': [
        {
          name: 'Accounts',
          tags: ['Accounts', 'Account Transactions', 'Account Stats'],
        },
        {
          name: 'Blockchain',
          tags: [
            'Blocks',
            'Txns',
            'Receipts',
            'Stats',
            'Validators',
            'Staking',
          ],
        },
        {
          name: 'Tokens',
          tags: ['FTs', 'NFTs', 'MTs', 'Intents'],
        },
        {
          name: 'Other',
          tags: ['Keys', 'Search', 'Multichain', 'Kitwallet'],
        },
      ],
    },
  };

  // ── Legacy API docs (v1/v2) ───────���───────────────────────────────
  const legacyOptions = {
    apis: [
      path.join(dir, 'routes/*.{ts,js}'),
      path.join(dir, 'routes/v2/**/*.{ts,js}'),
    ],
    definition: {
      components: {
        securitySchemes: {
          BearerAuth: {
            scheme: 'bearer',
            type: 'http',
          },
        },
      },
      info: {
        description: legacyDescription,
        title: ' ',
        version: '1.0.0',
      },
      openapi: '3.0.0',
      servers,
      tags: [
        { description: 'Deprecated.', name: 'Legacy / Account' },
        { description: 'Deprecated.', name: 'Legacy / Access Keys' },
        { description: 'Deprecated.', name: 'Legacy / Blocks' },
        { description: 'Deprecated.', name: 'Legacy / Chain Abstraction' },
        { description: 'Deprecated.', name: 'Legacy / Charts' },
        { description: 'Deprecated.', name: 'Legacy / DEX' },
        { description: 'Deprecated.', name: 'Legacy / FTs' },
        { description: 'Deprecated.', name: 'Legacy / Supply' },
        { description: 'Deprecated.', name: 'Legacy / NFTs' },
        { description: 'Deprecated.', name: 'Legacy / Search' },
        { description: 'Deprecated.', name: 'Legacy / Stats' },
        { description: 'Deprecated.', name: 'Legacy / Txns' },
        { description: 'Deprecated.', name: 'Legacy / Validators' },
        { description: 'Deprecated.', name: 'Legacy / V2 Account' },
        { description: 'Deprecated.', name: 'Legacy / V2 Txns' },
      ],
    },
  };

  const mainSpec = withResponses(
    swaggerJsdoc(mainOptions) as Record<string, unknown>,
  );
  const legacySpec = swaggerJsdoc(legacyOptions);

  // Specs are static per deploy: serialise once and let browsers/CDN cache.
  const sendJson = (body: string) => (_: Request, res: Response) => {
    res
      .set('Cache-Control', DOCS_CACHE_CONTROL)
      .type('application/json')
      .send(body);
  };

  app.get('/openapi.json', sendJson(JSON.stringify(mainSpec)));
  app.get('/openapi-legacy.json', sendJson(JSON.stringify(legacySpec)));

  // v1/v2 -> v3 migration guide, as HTML for browsers and markdown for tools.
  // Read once at startup from the shipped asset
  // (dist/docs) or the source docs/ dir in dev; falls back if absent.
  let migrationGuide = '# Migration guide unavailable\n';
  for (const candidate of [
    path.join(dir, '..', 'docs', 'v3-migration.md'), // built: dist/docs
    path.join(dir, '..', '..', 'docs', 'v3-migration.md'), // dev: apps/api/docs
  ]) {
    try {
      migrationGuide = readFileSync(candidate, 'utf8');
      break;
    } catch {
      // try the next candidate
    }
  }

  // Rendered by Scalar like the rest of the docs: the guide is the description of an
  // endpoint-less spec, so its headings become the sidebar.
  const migrationSpec = {
    info: {
      description: migrationGuide.replace(/^# .*\n/, ''),
      title: 'Migrating to NearBlocks API v3',
      version: '3',
    },
    openapi: '3.1.0',
    paths: {},
  };
  app.get('/openapi-migration.json', (_, res) => {
    res.json(migrationSpec);
  });
  const migrationReference = apiReference({
    customCss: scalarCss,
    documentDownloadType: 'none',
    favicon: 'https://nearblocks.io/favicon_32x32.png',
    hideModels: true,
    layout: 'modern',
    metaData: {
      ...scalarMeta,
      description: 'How to move a NearBlocks API v1 or v2 integration to v3.',
      ogTitle: 'Migrating to API v3 | NearBlocks',
      title: 'Migrating to API v3 | NearBlocks',
    },
    theme: 'none',
    url: '/openapi-migration.json',
  });
  const sendMigrationMarkdown = (res: Response) =>
    res.type('text/markdown; charset=utf-8').send(migrationGuide);

  // Browsers get the rendered guide; curl and agents (Accept: */*) get markdown.
  app.get('/api-docs/migration.md', (_, res) => sendMigrationMarkdown(res));
  app.get('/api-docs/migration', (req, res, next) => {
    res.vary('Accept');
    if (req.accepts(['text/markdown', 'text/html']) === 'text/html')
      return next();
    sendMigrationMarkdown(res);
  });
  app.use('/api-docs/migration', migrationReference);

  app.use(
    '/api-docs/legacy',
    apiReference({
      cdn: SCALAR_CDN,
      customCss: scalarCss,
      documentDownloadType: 'none',
      favicon: 'https://nearblocks.io/favicon_32x32.png',
      layout: 'modern',
      metaData: scalarMeta,
      theme: 'none',
      url: '/openapi-legacy.json',
    }),
  );

  app.use(
    '/api-docs',
    apiReference({
      cdn: SCALAR_CDN,
      customCss: scalarCss,
      documentDownloadType: 'none',
      favicon: 'https://nearblocks.io/favicon_32x32.png',
      layout: 'modern',
      metaData: scalarMeta,
      theme: 'none',
      url: '/openapi.json',
    }),
  );
};

export default apiDocumentation;
