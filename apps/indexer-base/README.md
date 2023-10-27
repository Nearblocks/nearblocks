## Config

```
DATABASE_URL=
REDIS_URL=
NETWORK=mainnet
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

## Indexer

We have two indexer sections:

#### Main indexer

It syncs from the latest block height or genesis height. All contract files must be added here.
Path: `src/services/contract/{network}`

Contracts are matched by file names, so you should create files with contract names like:
| Contract name | File name |
| ------ | ------ |
| wrap.near | wrap.near.ts |
If you need to match multiple contracts, add a switch case in the `src/services/index.ts` file.
All contracts must default export a function that will receive 3 parameters on a successful contract match. Match events with your logic and index data into DB. Never call direct DB calls inside this files, you must call exported function to save FT/NFT data (`saveFTData`/`saveNFTData` exported from `#services/ft` & `#services/nft` respectively).

#### Sync jobs

It syncs from the provided start block height (`startsAt`). It also accepts an optional end block height (`stopsAt`). Preferably, use end block height; otherwise, jobs will run forever. You must reuse the function from the main indexer contract file here.
Path: `src/jobs/{network}`

An example sync job is in the `wrap.near.ts.txt` file. Copy the file, rename it with your contract name and remove the .txt extension. Follow the same file naming convention as the main indexer.
You only need to modify/change `config` & `onMessage` content. The rest of the file consists of the logic to start/stop the data stream. Once you match your contract inside the onMessage callback, use the exported function from the main indexer to match and insert event data.

⚠️ Start sync jobs with indexed block height; otherwise, you will get foreign-key constraint errors.
