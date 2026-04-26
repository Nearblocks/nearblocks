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
        description: `<p>NearBlocks provides REST APIs for accessing NEAR Protocol blockchain data. Our APIs enable developers to retrieve account information, analyze smart contracts, and track transactions. You can access the REST APIs using cURL or any HTTP client. We support GET requests only.</p>
        <p><h2>Attribution Requirements:</h2></p>
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
        }/v3/accounts/wrap.near"</pre></code></p>
        <h2>Legacy API</h2>
        <p>Documentation for deprecated v1/v2 endpoints is available at <a href="/api-docs/legacy">/api-docs/legacy</a>. These endpoints will be removed in a future release.</p>
        `,
        title: ' ',
        version: '1.0.0',
      },
      openapi: '3.0.0',
      servers,
      tags: [
        {
          description:
            'Retrieve account details, balances, contract metadata, access keys, token holdings, and transaction history for any NEAR account.',
          name: 'Accounts',
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
        description: `<p><strong>These are deprecated endpoints. They will be removed in a future release.</strong></p>
        <p>For new integrations, use the <a href="/api-docs">current API</a>.</p>
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
