import 'knex/types/tables';

import {
  AccessKey,
  Account,
  ActionReceiptAction,
  ActionReceiptOutputData,
  AssetsFungibleTokenEvent,
  AssetsNonFungibleTokenEvent,
  Block,
  Chunk,
  DailyStats,
  ErrorContract,
  ExecutionOutcome,
  ExecutionOutcomeReceipt,
  FtMeta,
  NftMeta,
  NftTokenMeta,
  Receipt,
  Setting,
  Stats,
  Transaction,
} from '#types/types';

declare module 'knex/types/tables.js' {
  interface Tables {
    access_keys: AccessKey;
    accounts: Account;
    action_receipt_actions: ActionReceiptAction;
    action_receipt_output_data: ActionReceiptOutputData;
    assets__fungible_token_events: AssetsFungibleTokenEvent;
    assets__non_fungible_token_events: AssetsNonFungibleTokenEvent;
    blocks: Block;
    chunks: Chunk;
    daily_stats: DailyStats;
    error_contracts: ErrorContract;
    execution_outcome_receipts: ExecutionOutcomeReceipt;
    execution_outcomes: ExecutionOutcome;
    ft_meta: FtMeta;
    nft_meta: NftMeta;
    nft_token_meta: NftTokenMeta;
    receipts: Receipt;
    settings: Setting;
    stats: Stats;
    transactions: Transaction;
  }
}
