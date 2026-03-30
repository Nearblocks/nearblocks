export const layout = {
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
      charts: 'Charts',
      multichain: 'Multichain Txns',
      nodes: 'Validators',
      title: 'Blockchain',
      txns: 'Transactions',
    },
    home: {
      title: 'Home',
    },
    languages: {
      title: 'Languages',
    },
    tokens: {
      nftTransfers: 'NFT Transfers',
      title: 'Tokens',
      tokenTransfers: 'Token Transfers',
      topNFTs: 'Top NFTs',
      topTokens: 'Top Tokens',
    },
    wallet: {
      signIn: 'Sign In',
    },
  },
  meta: {
    description:
      'NearBlocks is the leading blockchain explorer dedicated to the NEAR ecosystem. Powered by NEAR Protocol.',
    title: 'NEAR Protocol Explorer | NearBlocks',
  },
  scrollable: {
    more: 'Scroll for more',
    top: 'Scroll to top',
  },
  search: {
    addresses: 'Addresses',
    blocks: 'Blocks',
    filters: 'All Filters',
    placeholder: 'Search by Account ID / Txn Hash / Block',
    tokens: 'Tokens',
    txns: 'Txns',
  },
} as const;
