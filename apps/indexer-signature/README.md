## 📚 Indexer Signature

Signature indexer works with mpc signatures

### Config

```
DATABASE_URL=
DATABASE_URL_BASE=
NETWORK=mainnet

# Optional
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
SIGNATURE_START_BLOCK=
SENTRY_DSN=
```

### Supported Contracts

- Mainnet: v1.signer
- Testnet: v1.signer-prod.testnet, v1.signer-dev.testnet

### Migrations

Migrations can be applied by accessing the Docker container and executing the following command

```
cd apps/indexer-signature && yarn migrate
```
