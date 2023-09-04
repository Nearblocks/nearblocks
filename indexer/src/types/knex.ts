import 'knex/types/tables';
import {
  Block,
  Chunk,
  Account,
  Receipt,
  Setting,
  AccessKey,
  Transaction,
  ExecutionOutcome,
  ActionReceiptAction,
  ExecutionOutcomeReceipt,
  ActionReceiptOutputData,
  AssetsFungibleTokenEvent,
  AssetsNonFungibleTokenEvent,
} from '#ts/types';

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
    execution_outcome_receipts: ExecutionOutcomeReceipt;
    execution_outcomes: ExecutionOutcome;
    receipts: Receipt;
    settings: Setting;
    transactions: Transaction;
  }
}
