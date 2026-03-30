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
  title: 'Latest Multichain Transactions',
} as const;
