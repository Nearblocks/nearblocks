import path from 'path';

import { apiReference } from '@scalar/express-api-reference';
import { Application } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';

import { Network } from 'nb-types';

import config from '#config';

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
  .deprecation-callout {
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: 12px 16px;
    margin: 0 0 20px;
  }
  .deprecation-callout p { margin: 0; }
  .deprecation-callout a { color: inherit; text-decoration: underline; }
  .light-mode .deprecation-callout { background: #fffbeb; color: #92400e; }
  .dark-mode .deprecation-callout { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
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

const servers = [
  { description: 'Mainnet', url: config.mainnetUrl },
  { description: 'Testnet', url: config.testnetUrl },
];

const apiDocumentation = async (app: Application, dir: string) => {
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
        description: `<div class="deprecation-callout">
          <p><strong>⚠️ Deprecation notice:</strong> The v1 and v2 API endpoints are deprecated and will be removed in a future release. New integrations should use the current v3 API documented below. Documentation for the deprecated endpoints remains available at <a href="/api-docs/legacy">/api-docs/legacy</a>.</p>
        </div>
        <p>NearBlocks provides REST APIs for accessing NEAR Protocol blockchain data. Our APIs enable developers to retrieve account information, analyze smart contracts, and track transactions. You can access the REST APIs using cURL or any HTTP client. We support GET requests only.</p>
        <h2>Migrating from v1/v2</h2>
        <p>v3 is not a drop-in replacement for v1/v2. The main differences to plan for:</p>
        <ul>
        <li><strong>Numbers are strings.</strong> Token amounts, balances, deposits, gas and supply are returned as plain decimal strings (for example <code>"1234500000000000000000000000"</code>), never JSON numbers. Parse them with a big-number/decimal library &mdash; <code>Number()</code> or <code>parseInt()</code> will silently lose precision. (Some v1 aggregate amounts were returned as numbers and could appear in scientific notation such as <code>1e+24</code>; v3 never does.)</li>
        <li><strong>Response envelope.</strong> Every response is wrapped as <code>{ "data": ..., "meta": ... }</code>, with any errors under <code>errors</code>, instead of a resource-named key.</li>
        <li><strong>Cursor pagination.</strong> v3 uses opaque <code>next</code>/<code>prev</code> cursors together with <code>limit</code> (max 100). There is no <code>page</code>/<code>per_page</code>/<code>offset</code>; totals are exposed via separate <code>/count</code> endpoints.</li>
        <li><strong>Nested structure.</strong> Related fields are grouped into objects such as <code>actions_agg</code> and <code>outcomes_agg</code> plus a nested <code>block</code>, and transaction receipts are returned as a nested tree.</li>
        </ul>
        <p>Documentation for the deprecated endpoints remains at <a href="/api-docs/legacy">/api-docs/legacy</a>.</p>
        <h2>Attribution Requirements</h2>
        <p>The APIs are offered as a community service and are provided without any warranty. Please use them responsibly and only for what you need.</p>
        <p>Attribution is required on the free plan only. You can attribute by either including a link back to Nearblocks.io or stating that your app is &quot;Powered by Nearblocks.io APIs.&quot; Paid plans do not require attribution.</p>
        <p>To upgrade to a paid API plan with higher rate limits, head over to the <a href="https://nearblocks.io/apis">APIs</a> page and select a plan that suits your needs. Once payment has been made, you can create API keys to make requests to our endpoints.</p>
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
        }/v3/accounts/wrap.near"</pre></code></p>
        `,
        title: ' ',
        version: '1.0.0',
      },
      openapi: '3.0.0',
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
      ],
      'x-tagGroups': [
        {
          name: 'Accounts',
          tags: ['Accounts', 'Account Transactions', 'Account Stats'],
        },
        {
          name: 'Blockchain',
          tags: ['Blocks', 'Txns', 'Stats'],
        },
        {
          name: 'Tokens',
          tags: ['FTs', 'NFTs', 'MTs'],
        },
        {
          name: 'Other',
          tags: ['Keys', 'Search', 'Multichain'],
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
        description: `<div class="deprecation-callout">
          <p><strong>⚠️ Deprecated:</strong> These v1/v2 endpoints are deprecated and will be removed in a future release. For new integrations, use the <a href="/api-docs">current v3 API</a>.</p>
        </div>
        `,
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
        { description: 'Deprecated.', name: 'Legacy / Kitwallet' },
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

  const mainSpec = swaggerJsdoc(mainOptions);
  const legacySpec = swaggerJsdoc(legacyOptions);

  app.get('/openapi.json', (_, res) => {
    res.json(mainSpec);
  });

  app.get('/openapi-legacy.json', (_, res) => {
    res.json(legacySpec);
  });

  app.use(
    '/api-docs/legacy',
    apiReference({
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
