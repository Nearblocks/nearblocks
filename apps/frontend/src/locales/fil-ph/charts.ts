export const charts = {
  addresses: {
    description:
      'NEAR Unique Accounts chart shows the number of active accounts per day on the NEAR protocol.',
    heading: 'NEAR Unique Accounts Chart',
    meta: {
      description:
        'NEAR blockchain unique accounts chart shows the total distinct numbers of accounts on NEAR blockchain and the increase in the number of account daily.',
      title: 'NEAR Unique Accounts Chart',
    },
    miniTitle: 'NEAR Unique Accounts (14D)',
    series: 'Accounts',
    yAxis: 'Accounts',
  },
  blocks: {
    description:
      'NEAR Block Count chart shows the number of blocks produced per day on the NEAR protocol.',
    heading: 'NEAR Block Count Chart',
    meta: {
      description:
        'NEAR blockchain Block Count Chart shows the historical number of blocks produced daily on NEAR blockchain. All data is real-time, accurate and pulled directly from NEAR blockchain.',
      title: 'NEAR Block Count Chart',
    },
    miniTitle: 'NEAR Block Count (14D)',
    series: 'Blocks',
    yAxis: 'Blocks',
  },
  intentsSwaps: {
    description:
      'NEAR Intents Swaps chart shows the daily and cumulative number of swaps executed across NEAR Intents.',
    heading: 'NEAR Intents Swaps Chart',
    meta: {
      description:
        'NEAR Intents swaps chart shows the daily and all-time cumulative number of swaps executed across NEAR Intents.',
      title: 'NEAR Intents Swaps Chart',
    },
    miniTitle: 'NEAR Intents Swaps (14D)',
    seriesCumulative: 'Cumulative Swaps',
    seriesDaily: 'Daily Swaps',
    yAxis: 'Daily Swaps',
    yAxisCumulative: 'Cumulative Swaps',
  },
  intentsVolume: {
    description:
      'NEAR Intents Volume chart shows the daily and cumulative swap volume (USD) across NEAR Intents.',
    heading: 'NEAR Intents Volume Chart',
    meta: {
      description:
        'NEAR Intents volume chart shows the daily and all-time cumulative swap volume in USD across NEAR Intents.',
      title: 'NEAR Intents Volume Chart',
    },
    miniTitle: 'NEAR Intents Volume (14D)',
    seriesCumulative: 'Cumulative Volume (USD)',
    seriesDaily: 'Daily Volume (USD)',
    yAxis: 'Daily Volume (USD)',
    yAxisCumulative: 'Cumulative Volume (USD)',
  },
  logView: 'Log View',
  logViewTip:
    'Toggle between Log View and Normal View. Log View uses logarithmic scale.',
  marketCap: {
    description:
      'NEAR Market Capitalization chart shows the historical market cap of NEAR in USD.',
    heading: 'NEAR Market Capitalization Chart',
    meta: {
      description:
        'NEAR Market Capitalization chart shows the historical market cap of NEAR in USD.',
      title: 'NEAR Market Capitalization Chart',
    },
    miniTitle: 'NEAR Market Capitalization (14D)',
    series: 'NEAR Market Cap (USD)',
    yAxis: 'NEAR Market Cap (USD)',
  },
  meta: {
    description:
      'NearBlocks provides a suite of real-time NEAR data charts and statistics to track everything about NEAR: Price, Supply, Marketcap, Transaction Fee and others.',
    title: 'NEAR Charts & Statistics',
  },
  nearPrice: {
    description:
      'NEAR Daily Price chart shows the historical price of NEAR in USD.',
    heading: 'NEAR Daily Price (USD) Chart',
    meta: {
      description:
        'NEAR Daily Price (USD) chart shows the daily historical price for NEAR in USD. All data is real-time, accurate and pulled directly from NEAR blockchain.',
      title: 'NEAR Price Today: Info, Chart, Stats',
    },
    miniTitle: 'NEAR Daily Price (USD) (14D)',
    series: 'NEAR Price (USD)',
    yAxis: 'NEAR Price (USD)',
  },
  nearSupply: {
    description:
      'NEAR Supply Growth chart shows the total supply of NEAR tokens over time.',
    heading: 'NEAR Supply Growth Chart',
    meta: {
      description:
        'NEAR blockchain Supply Growth Chart shows a breakdown of daily block reward and the total NEAR supply. All data is real-time, accurate and pulled directly from NEAR blockchain.',
      title: 'NEAR Supply Chart : Circulating, Total Supply',
    },
    miniTitle: 'NEAR Supply Growth (14D)',
    series: 'NEAR Supply',
    yAxis: 'NEAR Supply',
  },
  title: 'NEAR Charts & Statistics',
  tps: {
    description:
      'NEAR TPS chart shows the number of transactions per second on the NEAR protocol, broken down by shard.',
    heading: 'NEAR Transactions Per Second (TPS) Chart',
    meta: {
      description:
        'NEAR TPS chart shows per-second transaction throughput with per-shard breakdown. Data is real-time and pulled directly from NEAR blockchain.',
      title: 'NEAR TPS Chart',
    },
    miniTitle: 'NEAR TPS (1H)',
    series: 'Total TPS',
    yAxis: 'Transactions per Second',
  },
  txnFee: {
    description:
      'Transaction Fee chart shows the total transaction fees paid per day in USD.',
    heading: 'NEAR Transaction Fee Chart',
    meta: {
      description:
        'NEAR blockchain transaction fee chart shows the daily amount in USD spent per transaction on NEAR blockchain. All data is real-time, accurate and pulled directly from NEAR blockchain.',
      title: 'NEAR Transaction Fee Chart',
    },
    miniTitle: 'NEAR Transaction Fee (14D)',
    series: 'Transaction Fee (USD)',
    yAxis: 'Transaction Fee (USD)',
  },
  txns: {
    description:
      'NEAR Daily Transactions chart shows the number of transactions per day on the NEAR protocol.',
    heading: 'NEAR Daily Transactions Chart',
    meta: {
      description:
        'NEAR transactions chart highlights the total number of transactions on NEAR blockchain with daily individual breakdown for total transaction , total blocks and total new account seen.',
      title: 'NEAR Transactions Chart: Info, Statistics, Growth',
    },
    miniTitle: 'NEAR Daily Txns (14D)',
    series: 'Transactions per Day',
    yAxis: 'Transactions per Day',
  },
  txnVolume: {
    description:
      'Transaction Volume chart shows the total transaction volume in USD per day.',
    heading: 'NEAR Transaction Volume Chart',
    meta: {
      description:
        'NEAR blockchain transaction volume chart shows the daily amount in USD spent per transaction on NEAR blockchain.',
      title: 'NEAR Transaction Volume Chart',
    },
    miniTitle: 'NEAR Transaction Volume (14D)',
    series: 'Transaction Volume (USD)',
    yAxis: 'Transaction Volume (USD)',
  },
  view: 'View All',
} as const;
