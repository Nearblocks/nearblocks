export const chainSignatures = {
  analytics: {
    gasBurnt: {
      title: 'Daily Gas Burnt',
      yAxis: 'Gas Burnt (Tgas)',
    },
    tabs: {
      gasBurnt: 'Gas Burnt',
      txns: 'Transactions',
    },
    txns: {
      title: 'Daily Transactions',
      yAxis: 'Transactions',
    },
  },
  meta: {
    description:
      'NEAR Protocol Chain Signatures (MPC) overview. View signer contract activity, gas usage, and MPC operators.',
    title: 'Chain Signatures',
  },
  operators: {
    empty: 'No MPC operators found',
    found: '{{count}} MPC operators found',
    list: {
      account: 'Account',
      publicKey: 'Public Key',
      tee: 'TEE',
      url: 'URL',
    },
    tee: {
      expires: 'Expires {{date}}',
      image: 'Image',
      mock: 'Mock attestation, not running in a TEE',
      no: 'No',
      none: 'No attestation on record',
      tdx: 'Genuine Intel TDX attestation verified on-chain',
      unknown: 'TEE status unavailable',
    },
    validator: 'Validator',
  },
  overview: {
    activity: {
      contract: 'Contract',
      title: 'Signer Contract Activity',
      totalGasBurnt: 'Total Gas Burnt',
      totalTxns: 'Total Transactions',
    },
    network: {
      inTee: 'Operators in TEE',
      threshold: 'Signing Threshold',
      title: 'MPC Network',
      totalOperators: 'Total Operators',
    },
  },
  tabs: {
    analytics: 'Analytics',
    operators: 'MPC Operators',
  },
  title: 'Chain Signatures',
} as const;
