# NearBlocks components - Built on BOS

## Table of Contents

- [Introduction](#introduction)
- [Local Environment Setup](#local-environment-setup)
- [Continuous Integration & Delivery](#continuous-integration--delivery)

## Introduction

The NearBlocks is built on BOS (Blockchain Operating System) and provides a convenient way to select and use our components. 

You can access all our deployed components here [https://near.social/mob.near/widget/LastWidgets?accountId=nearblocks.near](https://near.social/mob.near/widget/LastWidgets?accountId=nearblocks.near)

This document outlines the setup instructions, Continuous Integration & Delivery (CI/CD) processes, and configuration requirements for the project.

## Local Environment Setup

To enable instant preview in local environment and test changes without deploying to the mainnet, follow these steps:

1. **Download and Install BOS Loader**: Download the BOS Loader from [here](https://github.com/near/bos-loader/releases) and install it.

2. **Set Loader URL**: Open [https://test.near.org/flags](https://test.near.org/flags) and set the loader URL to `http://127.0.0.1:3030`.

3. **Install Dependencies**: export ACCOUNT and Navigate to the `bos-components` directory and run the following command to install dependencies:

   `yarn`

4. **Launch Testnet Preview**: Run the following command to launch the testnet preview page and BOS loader:

   `yarn dev`

Or use it in app by adding: `account`/widget/`Near BOS Component` into the Widget.

## Continuous Integration & Delivery

We use the [BOS CLI](https://github.com/bos-cli-rs/bos-cli-rs "BOS CLI") (Command Line Interface) in conjunction with GitHub Actions to automate Continuous Integration (CI) and Continuous Delivery (CD). This streamlined process ensures smooth code deployment to both testnet and mainnet environments.

### Configuration Requirements

This repository includes a reusable workflow that you can leverage from component repository. To set up this workflow, follow these steps:

Prepare access key that will be used for components deployment.

It is recommended to use a dedicated function-call-only access key, so you need to:

1.1. (Optional) Creating a new account. Here is [near CLI RS](https://github.com/near/near-cli-rs "near CLI RS") command to do that:

> ```bash
> # Create the key  (change account.near to NEAR Account)
> near account create-account fund-later use-auto-generation save-to-folder .near-credentials/mainnet/near.account
> ```
>
> ```bash
> # Check it in
> /.near-credentials/mainnet/near.account.json
> ```

1.2. Replace account_id with the account id where you want to deploy BOS components:

> ```bash
> # For testnet:
> export ACCOUNT_ID_TESTNET=nearblocks.testnet
> ```
>
> ```bash
> # For mainnet:
> export ACCOUNT_ID_MAINNET=nearblocks.near
> ```

1.3. Add a new access key to account, explicitly adding permissions to call the set method. 

> ```bash
> # For testnet:
> near account add-key  "$ACCOUNT_ID_TESTNET" grant-function-call-access --allowance '1 NEAR' --receiver-account-id v1.social08.testnet --method-names 'set' autogenerate-new-keypair print-to-terminal network-config testnet
> ```

> ```bash
> # For mainnet:
> near account add-key  "$ACCOUNT_ID_MAINNET" grant-function-call-access --allowance '1 NEAR' --receiver-account-id social.near --method-names 'set' autogenerate-new-keypair print-to-terminal network-config mainnet
> ```

You will get the output eg.

```
Public Key: ed25519:123
SECRET KEYPAIR: ed25519:321
```

> ```bash
> # For testnet:
> export PUBLIC_KEY_TESTNET=ed25519:123
> ```

> ```bash
> # For mainnet:
> export PUBLIC_KEY_MAINNET=ed25519:123
> ```

1.4. Grant write permission to the key

> ```bash
> # For testnet:
> near contract call-function as-transaction v1.social08.testnet  grant_write_permission json-args '{"public_key": "$PUBLIC_KEY_TESTNET", "keys": ["$ACCOUNT_ID_TESTNET/widget"]}' prepaid-gas '100.000 TeraGas' attached-deposit '1 NEAR' sign-as "$ACCOUNT_ID_TESTNET" network-config testnet
> ```
>
> ```bash
> # For mainnet:
> near contract call-function as-transaction social.near grant_write_permission json-args '{"public_key": "$PUBLIC_KEY_MAINNET", "keys": ["$ACCOUNT_ID_MAINNET/widget"]}' prepaid-gas '100.000 TeraGas' attached-deposit '1 NEAR' sign-as "$ACCOUNT_ID_MAINNET" network-config mainnet
> ```
>
> Note: The attached deposit is going to be used to cover the storage costs associated with the data you store on BOS, 1 NEAR is enough to store 100kb of data (components code, metadata, etc).

**GitHub Secrets and Variables**:

- Go to _Settings > Secrets and Variables > Actions_ and create a repository secret and variable mentioned in bottom

#### Testnet Deployment

We have implemented a GitHub Actions workflow for testnet deployment. This workflow automatically deploys the latest commit from a pull request (PR) to the testnet for preview and testing purposes. Note that the workflow is configured to use the `TESTNET_DEPLOY_ACCOUNT`.

_GitHub Actions Variables and Secrets for Deployment_:

- `TESTNET_DEPLOY_ACCOUNT` (value of $ACCOUNT_ID_TESTNET - put in variables)
- `TESTNET_SIGNER_ACCOUNT` (value of $ACCOUNT_ID_TESTNET - put in variables)
- `TESTNET_SIGNER_PUBLIC_KEY` (value of $PUBLIC_KEY_TESTNET - put in variables)
- `TESTNET_SIGNER_PRIVATE_KEY` (value of SECRET KEYPAIR - put in secrets)

#### Mainnet Deployment

We also have a GitHub Actions workflow for deploying the latest components from the `main` branch to the mainnet.

_GitHub Actions Variables and Secrets for Deployment_:

- `MAINNET_DEPLOY_ACCOUNT` (value of $ACCOUNT_ID_MAINNET - put in variables)
- `MAINNET_SIGNER_ACCOUNT` (value of $ACCOUNT_ID_MAINNET - put in variables)
- `MAINNET_SIGNER_PUBLIC_KEY` (value of $PUBLIC_KEY_MAINNET - put in variables)
- `MAINNET_SIGNER_PRIVATE_KEY` (value of SECRET KEYPAIR - put in secrets)
