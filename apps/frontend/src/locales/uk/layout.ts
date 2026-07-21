export const layout = {
  banner: {
    newUi: {
      dismiss: 'Dismiss banner',
      feedbackLink: 'Send feedback',
      legacyLink: 'Switch to legacy UI',
      message: 'You’re on the new NearBlocks experience.',
    },
  },
  errors: {
    footer: {
      button: 'Return Home',
      description: 'If you think this is a problem,',
      link: 'please tell us',
    },
    notFound: {
      description: 'The requested URL was not found on this server.',
      title: 'Page not found!',
    },
    serverError: {
      description:
        'Sorry, we encountered an unexpected error. Please try again later.',
      title: 'Something went wrong!',
    },
  },
  footer: {
    copyright: 'NearBlocks ©',
    description:
      'NearBlocks is the leading blockchain explorer dedicated to the NEAR ecosystem. Powered by NEAR Protocol.',
    disclaimer: 'Price feeds aggregated by',
    menu: {
      company: {
        about: 'About',
        contact: 'Contact',
        privacy: 'Privacy Policy',
        status: 'Status',
        terms: 'Terms & Conditions',
        title: 'Company',
      },
      explore: {
        blocks: 'Latest Blocks',
        charts: 'Charts & Stats',
        nodes: 'Validators',
        title: 'Explore',
        transactions: 'Latest Transactions',
      },
      tools: {
        advertise: 'Advertise',
        apis: 'NEAR Indexer APIs',
        nearValidate: 'NEAR Validate',
        title: 'Tools',
      },
    },
    trademark:
      'NearBlocks is operated full and on its own. NearBlocks is not associated to The NEAR Foundation and every licensed trademark displayed on this website belongs to their respective owners.',
  },
  header: {
    nearPrice: 'NEAR Price',
    switchNetwork: 'Switch Network',
    testnetNetwork: 'Testnet Network',
    toggleMenu: 'Toggle Menu',
    toggleTheme: 'Toggle Theme',
  },
  menu: {
    blockchain: {
      blocks: 'Blocks',
      chainSignatures: 'Chain Signatures',
      charts: 'Charts',
      multichain: 'Multichain Txns',
      nearIntents: 'Near Intents',
      nodes: 'Validators',
      title: 'Blockchain',
      txns: 'Transactions',
    },
    developers: {
      apiDocs: 'API Documentation',
      apiPlans: 'API Plans',
      title: 'Developers',
    },
    home: {
      title: 'Home',
    },
    languages: {
      title: 'Languages',
    },
    tokens: {
      mtTransfers: 'MT Transfers',
      nearIntents: 'Near Intents Transfers',
      nftTransfers: 'NFT Transfers',
      title: 'Tokens',
      tokenTransfers: 'Token Transfers',
      topMTs: 'Top MT Tokens',
      topNFTs: 'Top NFTs',
      topTokens: 'Top Tokens',
    },
    tools: {
      accountBalance: 'Balance Checker',
      csvExport: 'CSV Export',
      keypair: 'Keypair Generator',
      title: 'Tools',
      unitConverter: 'Unit Converter',
    },
    wallet: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
    },
  },
  meta: {
    description:
      'NearBlocks is the leading blockchain explorer dedicated to the NEAR ecosystem. Powered by NEAR Protocol.',
    title: 'NEAR Protocol Explorer | NearBlocks',
  },
  notice: {
    outOfSync:
      'Due to unexpected maintenance NearBlocks is out of sync. Some blocks or transactions may be delayed.',
  },
  scrollable: {
    more: 'Scroll for more',
    top: 'Scroll to top',
  },
  search: {
    addresses: 'Addresses',
    blocks: 'Blocks',
    filters: 'All Filters',
    history: 'Recent Searches',
    keys: 'Access Keys',
    mtTokens: 'MT Tokens',
    nftTokens: 'NFT Tokens',
    placeholder: 'Search by Account ID / Txn Hash / Block',
    receipts: 'Receipts',
    tokens: 'Tokens',
    txns: 'Txns',
  },
} as const;
