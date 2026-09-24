import path from 'path';
import { apiReference } from '@scalar/express-api-reference';
import { Application } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import config from '../config';
import { Network } from 'nb-types';

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
          name: 'Transactions Actions',
          description:
            'A service that parses and normalizes NEAR blockchain transactions into a clear, standardized JSON format. It recognizes core protocol actions such as transfers, staking, and function calls, while also interpreting contract-specific events across tokens, DeFi platforms, and NFTs. The API provides detailed decoding of method arguments, tracks cross-contract calls, and maps complex execution outcomes into human-readable actions. By exposing complete asset movement flows and smart contract behaviors, it helps developers, explorers, and analysts make sense of raw transaction data with accuracy and consistency.',
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
