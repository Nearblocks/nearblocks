export const staking = {
  list: {
    account: 'Account',
    amount: 'Amount',
    contract: 'Contract',
    empty: 'No staking txns found',
    method: 'Method',
    total: 'More than {{count}} staking txns found',
    txnHash: 'Transaction Hash',
  },
  meta: {
    description:
      'Latest NEAR Protocol staking transactions confirmed on NEAR Blockchain. The list consists of staking deposits, withdrawals, and related staking events.',
    title: 'Latest NEAR Protocol Staking Txns',
  },
  title: 'Latest NEAR Protocol Staking Txns',
} as const;
