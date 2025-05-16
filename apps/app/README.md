# NearBlocks

## Table of Contents

- [Local Environment Setup](#local-environment-setup)
- [Usage](#usage)
- [Configuration](#configuration)
- [Deployment](#deployment)

## Local Environment Setup

If modifying in local environment, please add this environment variable `.env` file:

## Usage

To set up and start NearBlocks, follow these steps:

Install dependencies using yarn:

`yarn`

Start NearBlocks:

`yarn dev`

NearBlocks will be accessible at http://localhost:3000.

## Configuration

Configure the NearBlocks by modifying the .env file. Customize settings such as ;

`NEXT_PUBLIC_NETWORK_ID=mainnet`
`NEXT_PUBLIC_MAINNET_URL=https://nearblocks.io`
`NEXT_PUBLIC_TESTNET_URL=https://testnet.nearblocks.io`
`AWS_ACCESS_KEY_ID=your-aws-access-key-id`
`AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key`
`AWS_REGION=your-aws-region`
`AWS_SES_TO_EMAIL=recipient@example.com`
`NEXT_PUBLIC_GTM_ID=GTM-P285ZPV2`

## Deployment

For deployment we use network (testnet, mainnet) by env variable ;

`NEXT_PUBLIC_NETWORK_ID`: Set the variable to the desired network for NearBlocks. This defines whether to redirect to mainnet or testnet URLs

There are two included docker-compose files which can be started with:

```
docker compose -f mainnet-app.yml up -d --build
docker compose -f testnet-app.yml up -d --build
```
