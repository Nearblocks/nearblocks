module.exports = {
  siteUrl:
    process.env.NEXT_PUBLIC_NETWORK_ID === 'mainnet'
      ? process.env.NEXT_PUBLIC_MAINNET_URL
      : process.env.NEXT_PUBLIC_TESTNET_URL,
  generateRobotsTxt: true,
};
