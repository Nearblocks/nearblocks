## 📅 Indexer Events

Events indexer works with events produced by NEPs: FT 💰, NFT 🖼️

You can find the code for legacy token implementations in the `src/services/contract` directory 📁 If you need to add support for a new token, you can create a new file in this directory and import it into the index file. Then you can match the new token to the appropriate contract 🤝 You can also use switch cases to match multiple contracts to the same file 🔀

### Config

```
DATABASE_URL=
NETWORK=mainnet
EVENTS_INDEXER_KEY=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_HOST=play.min.io
S3_PORT=9000
S3_USE_SSL=true

# Optional
DATABASE_URL_READ=
DATABASE_CA=
DATABASE_CERT=
DATABASE_KEY=
EVENTS_START_BLOCK=
SENTRY_DSN=
```
