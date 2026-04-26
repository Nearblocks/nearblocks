import path from 'path';

import { apiReference } from '@scalar/express-api-reference';
import { Application } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';

import { Network } from 'nb-types';

import config from '#config';

const apiDocumentation = async (app: Application, dir: string) => {
  const options = {
    apis: [path.join(dir, '**/*.{ts,js}')],
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
        <p>Include your API key in requests using as <code>Authorization</code> header with the following format:</p>
        <p>Replace API_KEY with the key string of your API key.</p>
        <p>For example, to pass an API key for an Account API:</p>
        <pre><code> curl -X GET -H "Authorization: Bearer API_KEY" "${
          config.network === Network.MAINNET
            ? config.mainnetUrl
            : config.testnetUrl
        }/v1/account/wrap.near"</pre></code></p>
        `,
        title: ' ',
        version: '1.0.0',
      },
      openapi: '3.0.0',
      servers: [
        { description: 'Mainnet', url: config.mainnetUrl },
        { description: 'Testnet', url: config.testnetUrl },
      ],
      tags: [
        // ── V3 (current) ──────────────────────────────────────────────
        {
          description:
            'Retrieve account details, balances, contract metadata, access keys, token holdings, and transaction history for any NEAR account.',
          name: 'V3 / Accounts',
        },
        {
          description:
            'Query blocks by hash or height, list recent blocks, and retrieve 24-hour block production statistics.',
          name: 'V3 / Blocks',
        },
        {
          description:
            'Look up fungible token contracts, list top tokens, and paginate through transfer history and holder data.',
          name: 'V3 / FTs',
        },
        {
          description:
            'Look up account information associated with a public access key.',
          name: 'V3 / Keys',
        },
        {
          description:
            'Query chain-signature multichain transactions and daily signing statistics.',
          name: 'V3 / Multichain',
        },
        {
          description:
            'Look up NFT contracts and individual tokens, list top collections, and paginate through transfer history and holder data.',
          name: 'V3 / NFTs',
        },
        {
          description:
            'Search across transactions, blocks, accounts, receipts, and tokens by hash, height, ID, or address.',
          name: 'V3 / Search',
        },
        {
          description:
            'Network-wide statistics including supply, gas usage, active accounts, and daily aggregates.',
          name: 'V3 / Stats',
        },
        {
          description:
            'List and filter transactions, retrieve transaction details with receipts, and inspect associated token events.',
          name: 'V3 / Txns',
        },
        // ── Legacy (v1/v2) — deprecated, will be removed ─────────────
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / Account',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / Access Keys',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / Blocks',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / Chain Abstraction',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / Charts',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / DEX',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / FTs',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / Kitwallet',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / Supply',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / NFTs',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / Search',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / Stats',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / Txns',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / Validators',
        },
        {
          description: 'Deprecated. These endpoints will be removed.',
          name: 'Legacy / V2 Account',
        },
        {
          description:
            'V2 transaction endpoints. Use V3 / Txns for new integrations.',
          name: 'Legacy / V2 Txns',
        },
      ],
      'x-tagGroups': [
        {
          name: 'API',
          tags: [
            'V3 / Accounts',
            'V3 / Blocks',
            'V3 / FTs',
            'V3 / Keys',
            'V3 / Multichain',
            'V3 / NFTs',
            'V3 / Search',
            'V3 / Stats',
            'V3 / Txns',
          ],
        },
        {
          name: 'Legacy (Deprecated)',
          tags: [
            'Legacy / Account',
            'Legacy / Access Keys',
            'Legacy / Blocks',
            'Legacy / Chain Abstraction',
            'Legacy / Charts',
            'Legacy / DEX',
            'Legacy / FTs',
            'Legacy / Kitwallet',
            'Legacy / Supply',
            'Legacy / NFTs',
            'Legacy / Search',
            'Legacy / Stats',
            'Legacy / Txns',
            'Legacy / Validators',
            'Legacy / V2 Account',
            'Legacy / V2 Txns',
          ],
        },
      ],
    },
  };

  const openapiSpecification = swaggerJsdoc(options);

  app.get('/openapi.json', (_, res) => {
    res.json(openapiSpecification);
  });

  app.use(
    '/api-docs',
    apiReference({
      customCss: `
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
          
      `,
      documentDownloadType: 'none',
      favicon: 'https://nearblocks.io/favicon_32x32.png',
      layout: 'modern',
      metaData: {
        description:
          'NearBlocks REST API documentation for the NEAR Protocol. Provides endpoints to access blockchain data and integrate seamlessly with NEAR.',
        ogDescription:
          'NearBlocks REST API documentation for the NEAR Protocol. Provides endpoints to access blockchain data and integrate seamlessly with NEAR.',
        ogTitle: 'Near(Ⓝ) REST API | NearBlocks',
        title: 'Near(Ⓝ) REST API | NearBlocks',
        twitterDescription:
          'NearBlocks REST API documentation for the NEAR Protocol. Provides endpoints to access blockchain data and integrate seamlessly with NEAR.',
        twitterTitle: 'Near(Ⓝ) REST API | NearBlocks',
      },
      theme: 'none',
      url: '/openapi.json',
    }),
  );
};

export default apiDocumentation;
