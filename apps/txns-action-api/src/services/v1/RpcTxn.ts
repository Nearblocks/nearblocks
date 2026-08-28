import { transactionStatus } from 'src/libs/rpc';
import { getBlockDetails } from 'src/libs/rpc';
import type { Provider } from 'near-api-js/lib/providers/provider';
import {
  calculateTotalDeposit,
  calculateTotalGas,
  calculateGasUsed,
  txnFee,
} from 'src/utils/near';

export async function parseRpcTxn({
  provider,
  hash,
  signerId,
  cacheRef,
}: {
  provider: Provider;
  hash: string;
  signerId: string;
  cacheRef: { current: Record<string, any> };
}) {
  const failoverProvider = provider as any;
  const rpcUrl =
    failoverProvider?.providers?.[failoverProvider.currentProviderIndex]
      ?.connection?.url;

  const result = await transactionStatus(rpcUrl, hash, 'bowen', cacheRef);
  if (!result.success || !result.data) return null;

  const txn = result.data;

  const block = await getBlockDetails(
    rpcUrl,
    txn.transaction_outcome.block_hash,
  );

  const modifiedTxns = {
    transaction_hash: txn.transaction_outcome.id,
    signer_account_id: txn.transaction.signer_id,
    receiver_account_id: txn.transaction.receiver_id,
    included_in_block_hash: txn.transaction_outcome.block_hash,
    block: {
      block_height: block?.header?.height || 0,
    },
    block_timestamp: block?.header?.timestamp_nanosec || '0',
    outcomes: {
      status: txn.status?.Failure ? false : true,
    },
    outcomes_agg: {
      gas_used: calculateGasUsed(
        txn.receipts_outcome ?? [],
        txn.transaction_outcome.outcome.gas_burnt ?? '0',
      ),
      transaction_fee: txnFee(
        txn.receipts_outcome ?? [],
        txn.transaction_outcome.outcome.tokens_burnt ?? '0',
      ),
    },
    actions_agg: {
      deposit: calculateTotalDeposit(txn.transaction.actions),
      gas_attached: calculateTotalGas(txn.transaction.actions),
    },
    receipt_conversion_gas_burnt:
      txn.transaction_outcome.outcome.gas_burnt.toString(),
    receipt_conversion_tokens_burnt:
      txn.transaction_outcome.outcome.tokens_burnt,
    raw: txn,
  };

  return modifiedTxns;
}
