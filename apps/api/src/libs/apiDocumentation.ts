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
        {
          description: `The "Account" endpoints provide access to various details about NEAR Protocol accounts, including account and contract information, deployment records, token inventories, access keys, and transaction histories. These endpoints also offer estimated counts for transactions, receipts, and balance changes, with support for pagination to efficiently manage large data sets.`,
          name: 'Account',
        },
        {
          description: `The "Blocks" endpoints allow retrieval of block information on the NEAR Protocol, including specific block details, the latest blocks, and blocks by pagination. They also provide an estimated total count of blocks, helping to manage and navigate the blockchain data efficiently.`,
          name: 'Blocks',
        },
        {
          description:
            'The "Chain Abstraction" endpoints provide access to multichain data, including retrieving multichain accounts and transactions for a specific account. They support paginated queries for multichain transactions and offer estimated counts for multichain transactions, enabling comprehensive tracking.',
          name: 'Chain Abstraction',
        },
        {
          description: `The "Charts" endpoints offer chart data related to key blockchain statistics. These charts provide visual insights into the overall performance and metrics of the blockchain.`,
          name: 'Charts',
        },
        {
          description: `The "DEX" endpoints provide data on decentralized exchange pairs, including information on top pairs, transaction details, and charts. Fetches pair data and transaction history with pagination support, along with charts to visualize the trading activity.`,
          name: 'DEX',
        },
        {
          description: `The "FTs" endpoints provide data on fungible tokens, including the top tokens, transaction details, token holders, and more. They allow for pagination of token transactions and holders, and provide estimated counts for transactions and holders, along with token-specific information.`,
          name: 'FTs',
        },
        {
          description: 'Access keys related endpoints.',
          name: 'Access Keys',
        },
        {
          description: `The "Kitwallet" endpoints focus on account activities, staking pools, and related data. They provide access to staking deposits, account activities, call receivers, and likely tokens or NFTs for an account. Additionally, they offer details about account receipts, along with estimated counts.`,
          name: 'Kitwallet',
        },
        {
          description: `The "Legacy" endpoints provide information on the Near supply, including total and circulating supply, as well as the daily token burn rate.`,
          name: 'Legacy',
        },
        {
          description: `The "NFTs" endpoints provide detailed information about non-fungible tokens (NFTs), including top NFTs, transactions, holders, and token data. You can fetch NFT transactions and token info, along with paginated list and estimated counts for transactions, holders, and tokens.`,
          name: 'NFTs',
        },
        {
          description:
            'The "Search" endpoints allow you to search for various blockchain entities, such as transactions, blocks, accounts, receipts, and tokens. You can search by specific identifiers like hash, block height, account ID, receipt ID, and token address.',
          name: 'Search',
        },
        { description: 'Statistical data endpoints.', name: 'Stats' },
        {
          description: `The "Transactions" endpoints provide access to transaction data. You can retrieve transactions by pagination, view the total estimated count, get the latest transactions, and fetch detailed information about specific transactions, including receipts and execution outcomes.`,
          name: 'Txns',
        },
        { description: 'Validator information endpoints.', name: 'Validators' },
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
      favicon: 'https://nearblocks.io/favicon_32x32.png',
      hideDownloadButton: true,
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
      spec: {
        url: '/openapi.json',
      },
      theme: 'none',
    }),
  );
};

export default apiDocumentation;
