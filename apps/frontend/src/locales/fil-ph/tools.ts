export const tools = {
  export: {
    accountLabel: 'Account',
    blockEnd: 'End Block',
    blockStart: 'Start Block',
    captchaHint: 'Please complete the captcha before downloading.',
    dateEnd: 'End Date',
    dateStart: 'Start Date',
    download: 'Download',
    exportTypeLabel: 'Export type',
    filterBlock: 'Block Range',
    filterDate: 'Date Range',
    reset: 'Reset',
    subtitle:
      'The earliest 5,000 records within the selected range will be exported.',
    title: 'Download Data (CSV Export)',
    types: {
      ft_transfers: 'FT Transfers',
      keys: 'Access Keys',
      mt_transfers: 'MT Transfers',
      nft_transfers: 'NFT Transfers',
      receipts: 'Receipts',
      staking: 'Staking Txns',
      transactions: 'Transactions',
    },
  },
  nav: {
    csvExport: 'CSV Export',
    tools: 'Tools',
  },
} as const;
