import pgPromise from 'pg-promise';
import { ISSLConfig } from 'pg-promise/typescript/pg-subset.js';

import config from '#config';

export const pgp = pgPromise();
const ssl: ISSLConfig = {
  rejectUnauthorized: true,
};

if (config.dbCa) {
  ssl.ca = Buffer.from(config.dbCa, 'base64').toString('utf-8');
  ssl.cert = Buffer.from(config.dbCert, 'base64').toString('utf-8');
  ssl.key = Buffer.from(config.dbKey, 'base64').toString('utf-8');
}

export const pool = pgp({
  application_name: 'indexer-base',
  connectionString: config.dbUrl,
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 30000,
  max: 20,
  ssl: ssl?.ca ? ssl : false,
});

export const accountColumns = new pgp.helpers.ColumnSet(
  [
    'account_id',
    'created_by_block_height',
    'created_by_receipt_id',
    'deleted_by_block_height',
    'deleted_by_receipt_id',
  ],
  { table: 'accounts' },
);

export const accessKeyColumns = new pgp.helpers.ColumnSet(
  [
    'account_id',
    'created_by_block_height',
    'created_by_receipt_id',
    'deleted_by_block_height',
    'deleted_by_receipt_id',
    'permission_kind',
    'public_key',
  ],
  { table: 'access_keys' },
);

export const blockColumns = new pgp.helpers.ColumnSet(
  [
    'author_account_id',
    'block_bytea',
    'block_hash',
    'block_height',
    'block_json',
    'block_timestamp',
    'gas_price',
    'prev_block_hash',
    'total_supply',
  ],
  { table: 'blocks' },
);

export const chunkColumns = new pgp.helpers.ColumnSet(
  [
    'author_account_id',
    'chunk_hash',
    'gas_limit',
    'gas_used',
    'included_in_block_hash',
    'included_in_block_timestamp',
    'shard_id',
  ],
  { table: 'chunks' },
);

export const receiptColumns = new pgp.helpers.ColumnSet(
  [
    'included_in_block_hash',
    'included_in_block_timestamp',
    'included_in_chunk_hash',
    'index_in_chunk',
    'originated_from_transaction_hash',
    'predecessor_account_id',
    'public_key',
    'receipt_id',
    'receipt_kind',
    'receiver_account_id',
  ],
  { table: 'receipts' },
);

export const receiptActionsColumns = new pgp.helpers.ColumnSet(
  [
    'action_kind',
    'args',
    'index_in_action_receipt',
    'nep518_rlp_hash',
    'receipt_id',
    'receipt_included_in_block_timestamp',
    'receipt_predecessor_account_id',
    'receipt_receiver_account_id',
  ],
  { table: 'action_receipt_actions' },
);

export const receiptInputColumns = new pgp.helpers.ColumnSet(
  ['input_data_id', 'input_to_receipt_id'],
  { table: 'action_receipt_input_data' },
);

export const receiptOutputColumns = new pgp.helpers.ColumnSet(
  ['output_data_id', 'output_from_receipt_id', 'receiver_account_id'],
  { table: 'action_receipt_output_data' },
);

export const exectionColumns = new pgp.helpers.ColumnSet(
  [
    'executed_in_block_hash',
    'executed_in_block_timestamp',
    'executor_account_id',
    'gas_burnt',
    'index_in_chunk',
    'logs',
    'receipt_id',
    'shard_id',
    'status',
    'tokens_burnt',
  ],
  { table: 'execution_outcomes' },
);

export const executionOutcomeColumns = new pgp.helpers.ColumnSet(
  ['executed_receipt_id', 'index_in_execution_outcome', 'produced_receipt_id'],
  { table: 'execution_outcome_receipts' },
);

export const transactionColumns = new pgp.helpers.ColumnSet(
  [
    'block_timestamp',
    'converted_into_receipt_id',
    'included_in_block_hash',
    'included_in_chunk_hash',
    'index_in_chunk',
    'receipt_conversion_gas_burnt',
    'receipt_conversion_tokens_burnt',
    'receiver_account_id',
    'signer_account_id',
    'status',
    'transaction_hash',
  ],
  { table: 'transactions' },
);
