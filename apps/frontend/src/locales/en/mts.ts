export const mts = {
  nearIntents: {
    heading: 'Near Intents Transfers',
    meta: {
      description:
        'Browse NEAR Intents multi-token transfers on the NEAR Protocol blockchain.',
      title: 'Near Intents Transfers',
    },
  },
  transfers: {
    affected: 'Affected',
    empty: 'No mt token txns found',
    heading: 'Token Transfers (NEP-245)',
    involved: 'Involved',
    method: 'Method',
    quantity: 'Quantity',
    token: 'Token',
    total: 'More than {{count}} transfers found',
    totalExact: 'A total of {{count}} transfers found',
    txnHash: 'Transaction Hash',
  },
  transfersMeta: {
    description:
      'Browse all NEAR Protocol multi-token transfers. Track multi-token movements, accounts, collections, and amounts.',
    title: 'MT Token Transfers (NEP-245)',
  },
} as const;
