export const nfts = {
  cidMeta: {
    description:
      'All you need to know about the {{name}} NFT Collection : Statistics, total supply, number of holders, latest transactions & meta-data.',
    label: 'NEAR NFT',
    title: '{{name}} NFT Stats, Holders & Transactions',
  },
  contract: {
    holders: 'Holders',
    inventory: 'Inventory',
    label: 'NFT Token:',
    overview: {
      holders: 'Holders:',
      na: 'N/A',
      title: 'Overview',
      totalSupply: 'Total Supply:',
      transfers: 'Transfers:',
    },
    profile: {
      contract: 'Contract:',
      title: 'Profile Summary',
    },
    transfers: 'Transfers',
  },
  holders: {
    address: 'Address',
    empty: 'No token holders found',
    na: 'N/A',
    percentage: 'Percentage',
    quantity: 'Quantity',
    total: 'A total of {{count}} token holders found',
  },
  inventory: {
    empty: 'No NFT tokens found',
    owner: 'Owner: ',
    title: 'Token ID: ',
    total: 'A total of {{count}} tokens found',
  },
  meta: {
    description:
      'The list of Non-Fungible (NEP-171) Tokens (NFT) and their daily transfers in the NEAR Protocol on NearBlocks',
    title: 'NEAR NFT Token Tracker (NEP-171)',
  },
  tidMeta: {
    description:
      'All you need to know about the {{contract}} {{name}} NFT : Owner, standard, description, media and latest transactions.',
    label: 'NEAR NFT Token',
    title: '{{name}} | {{contract}}',
  },
  title: 'Non-Fungible Token Tracker (NEP-171)',
  token: {
    contract: 'Contract Address:',
    description: 'Description:',
    label: 'NFT:',
    nep171: 'NEP-171',
    overview: 'Overview',
    owner: 'Owner:',
    standard: 'Token Standard:',
    tokenId: 'Token ID:',
  },
  tokens: {
    contractsTotal: 'A total of {{count}} NFT Token Contracts found',
    empty: 'No NFT tokens found',
    token: 'TOKEN',
    tokens: 'Tokens',
    transfers24h: 'Transfers (24H)',
  },
  tokenTransfers: {
    block: 'Block',
    empty: 'No NFT token transfers found',
    from: 'From',
    method: 'Method',
    to: 'To',
    total: 'A total of {{count}} nft token txns found',
    txnHash: 'Txn Hash',
  },
  transfers: {
    columns: {
      from: 'From',
      to: 'To',
      token: 'Token',
      tokenId: 'Token ID',
      txnHash: 'Hash',
      type: 'Type',
    },
    empty: 'No NFT token transfers found',
    heading: 'NFT Token Transfers (NEP-171)',
    total: 'A total of {{count}} nft token txns found',
  },
  transfersMeta: {
    description:
      'Browse all NEP-171 non-fungible token transfers on NEAR Protocol. Track NFT movements, collections, and owners.',
    title: 'NFT Token Transfers (NEP-171)',
  },
} as const;
