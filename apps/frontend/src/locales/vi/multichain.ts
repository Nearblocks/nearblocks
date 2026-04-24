export const multichain = {
  list: {
    blockHeight: 'Block Height',
    destAddress: 'Destination Address',
    destTxn: 'Destination Txn Hash',
    empty: 'No multichain transactions found',
    from: 'From',
    notIndexed: 'Destination network not indexed',
    receiptId: 'Receipt ID',
    sourceTxn: 'Source Txn Hash',
  },
  meta: {
    description:
      'Latest NEAR Protocol multichain transactions. View cross-chain signatures and their destination network details.',
    title: 'Latest Multichain Transactions',
  },
  stats: {
    accounts: 'Unique Accounts (24H)',
    addresses: 'Unique Destination Addresses (24H)',
    chains: 'Destination Chains (24H)',
    txns: 'Transactions (24H)',
  },
  title: 'Latest Multichain Transactions',
} as const;
