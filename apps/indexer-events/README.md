## 📅 Indexer Events

Events indexer works with events produced by NEPs: FT 💰, NFT 🖼️

You can find the code for legacy token implementations in the `src/services/contract` directory 📁 If you need to add support for a new token, you can create a new file in this directory and import it into the index file. Then you can match the new token to the appropriate contract 🤝 You can also use switch cases to match multiple contracts to the same file 🔀

### Config

```
DATABASE_URL=
REDIS_URL=
RPC_URL=
NETWORK=mainnet
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Optional
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
SENTRY_DSN=
```
