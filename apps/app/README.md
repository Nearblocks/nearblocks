# NearBlocks

## Table of Contents

- [Local Environment Setup](#local-environment-setup)
- [Usage](#usage)
- [Configuration](#configuration)
- [Deployment](#deployment)

## Local Environment Setup

If modifying in local environment, please add this environment variable `.env` file:

## Usage

To set up and start application, follow these steps:

Install required dependencies using yarn:

`yarn`

Start the Development Server

`yarn dev`

Once the server is running, the application will be accessible at http://localhost:3000.

## Configuration

To adjust the application's configuration, edit the .env file and set these variables:

`NEXT_PUBLIC_NETWORK_ID=mainnet`
`NEXT_PUBLIC_MAINNET_URL=https://nearblocks.io`
`NEXT_PUBLIC_TESTNET_URL=https://testnet.nearblocks.io`
`AWS_ACCESS_KEY_ID=your-aws-access-key-id`
`AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key`
`AWS_REGION=your-aws-region`
`AWS_SES_TO_EMAIL=recipient@example.com`
`NEXT_PUBLIC_GTM_ID=GTM-P285ZPV2`

## Deployment

The target network for deployment (testnet or mainnet) is configured using environment variables:

`NEXT_PUBLIC_NETWORK_ID`: Set this variable to either mainnet or testnet to determine which network endpoints the application will use.

There are two included docker-compose files which can be started with:

```
docker compose -f mainnet-app.yml up -d --build
docker compose -f testnet-app.yml up -d --build
```
