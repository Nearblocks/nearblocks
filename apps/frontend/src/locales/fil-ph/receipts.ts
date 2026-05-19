export const receipts = {
  list: {
    block: 'Block',
    deposit: 'Deposit Value',
    empty: 'No receipts found',
    filterBlock: 'Block Hash',
    from: 'From',
    method: 'Method',
    receiptId: 'Receipt ID',
    to: 'To',
    total: 'More than {{count}} receipts found',
    totalExact: 'A total of {{count}} receipts found',
  },
  meta: {
    description:
      'Latest NEAR Protocol receipts confirmed on NEAR Blockchain. The list consists of receipts and execution outcomes for transactions on NEAR.',
    title: 'Latest NEAR Protocol Receipts',
  },
  title: 'Latest NEAR Protocol Receipts',
  titleByAccount: 'Receipts for',
  titleByBlock: 'Receipts in Block',
} as const;
