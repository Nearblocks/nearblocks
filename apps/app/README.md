# NearBlocks - BOS Gateway for NearBlocks Component

## Table of Contents

- [Introduction](#introduction)
- [Local Environment Setup](#local-environment-setup)
- [Usage](#usage)
- [Configuration](#configuration)
- [Deployment](#deployment)

## Introduction

The nearblocks is a Next.js app that serves as a NEAR BOS gateway for the NearBlocks component built on BOS.

## Local Environment Setup

If modifying the BOS component in local environment, please add this environment variable `.env` file:

`NEXT_PUBLIC_LOADER_URL=http://127.0.0.1:3030` (BOS Loader Url default is http://127.0.0.1:3030)

## Usage

To set up and start the nearblocks Gateway, follow these steps:

Install dependencies using yarn:

`yarn`

Start the gateway:

`yarn dev`

The gateway will be accessible at http://localhost:3000. Users can access the BOS Component NearBlocks.

## Configuration

Configure the nearblocks Gateway by modifying the .env file. Customize settings such as ;

`NEXT_PUBLIC_NETWORK_ID=mainnet`
`NEXT_PUBLIC_ACCOUNT_ID=nearblocks.near`
`NEXT_PUBLIC_BOS_NETWORK=mainnet`
`NEXT_PUBLIC_OG_URL=https://meta.nearblocks.io/api`
`NEXT_PUBLIC_MAINNET_URL=https://nearblocks.io`
`NEXT_PUBLIC_TESTNET_URL=https://testnet.nearblocks.io`
`BREVO_URL=https://api.brevo.com/v3/smtp/email`
`BREVO_API_KEY=`
`BREVO_TO_EMAIL=luke@nearblocks.io`
`NEXT_PUBLIC_GTM_ID=GTM-P285ZPV2`

## Deployment

For deployment we use network (testnet, mainnet) by env variable ;

`NEXT_PUBLIC_NETWORK_ID`: Set the variable to the desired network for nearblocks gateway. This defines whether to redirect to mainnet or testnet URLs

`NEXT_PUBLIC_BOS_NETWORK`: Set this variable to the network the BOS component is hosted on

`NEXT_PUBLIC_ACCOUNT_ID`: Set this variable as account id the BOS component is created by

There are two included docker-compose files which can be started with:

```
docker compose -f docker-compose.mainnet.yml up -d --build
docker compose -f docker-compose.testnet.yml up -d --build
```
