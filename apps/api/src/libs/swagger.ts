import { createRequire } from 'module';

import { Application } from 'express';

const require = createRequire(import.meta.url);
const expressJSDocSwagger = require('express-jsdoc-swagger');

const swagger = (app: Application, dir: string) =>
  expressJSDocSwagger(app)({
    baseDir: dir,
    filesPattern: './**/*.{ts,js}',
    info: {
      description:
        '<p>The Near Blocks Near Developer REST APIs are provided as a community service and without warranty, so please use what you need and no more. Source attribution via a link back or mention that your app is "Powered by Nearblocks.io APIs" is required except for personal/private usage. You can access the REST APIs using the cURL, or any HTTP client. We support GET requests only.</p><p>NearBlocks provides an API Pro plan which is a monthly subscription-based API service that provides higher rate limits for power users and commercial solutions. To upgrade to a paid API Plan, head over to the <a target="_blank" rel="noreferrer nofollow noopener" href="https://nearblocks.io/apis"><code>APIs</code></a> page and select a plan  that suits your needs. Once payment has been made, you can create API keys to make requests to our end points.</p><p>You can pass the API key into a REST API call as <code>Authorization</code> header with the following format. Replace API_KEY with the key string of your API key. For example, to pass an API key for an Account API:</p><pre><code> curl -X GET -H "Authorization: Bearer API_KEY" "https://api3.nearblocks.io/v1/account/wrap.near"</pre></code>',
      title: 'NearBlocks',
      version: '1.0.0',
    },
    security: {
      'Bearer Authentication': { scheme: 'bearer', type: 'http' },
    },
    servers: [
      { description: 'Mainnet', url: 'https://api3.nearblocks.io' },
      { description: 'Testnet', url: 'https://api3-testnet.nearblocks.io' },
    ],
    swaggerUiOptions: {
      customCss:
        '.swagger-ui .info{margin-top:20px}.swagger-ui .info hgroup.main .title{display:none}.swagger-ui .info hgroup.main{background:url(https://nearblocks.io/images/nearblocksblack.svg) no-repeat;height:40px;background-size:174px}',
      customfavIcon: 'https://nearblocks.io/favicon-32x32.png',
      customSiteTitle: 'Near (Ⓝ) REST API | NearBlocks',
      swaggerOptions: {
        layout: 'BaseLayout',
      },
    },
    swaggerUIPath: '/api-docs',
  });

export default swagger;
