import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  const imports = [
    import(`nearblocks-trans-next-intl/${locale}/common.json`),
    import(`nearblocks-trans-next-intl/${locale}/home.json`),
    import(`nearblocks-trans-next-intl/${locale}/blocks.json`),
    import(`nearblocks-trans-next-intl/${locale}/txns.json`),
    import(`nearblocks-trans-next-intl/${locale}/charts.json`),
    import(`nearblocks-trans-next-intl/${locale}/token.json`),
    import(`nearblocks-trans-next-intl/${locale}/contact.json`),
    import(`nearblocks-trans-next-intl/${locale}/top-accounts.json`),
    import(`nearblocks-trans-next-intl/${locale}/terms.json`),
    import(`nearblocks-trans-next-intl/${locale}/claim-address.json`),
    import(`nearblocks-trans-next-intl/${locale}/kb.json`),
    import(`nearblocks-trans-next-intl/${locale}/404.json`),
    import(`nearblocks-trans-next-intl/${locale}/address.json`),
    import(`nearblocks-trans-next-intl/${locale}/multi-chain-txns.json`),
  ];
  const results = await Promise.allSettled(imports);
  const messages = results.reduce((acc, result) => {
    if (result.status === 'fulfilled') {
      return { ...acc, ...result.value.default };
    } else {
      return acc;
    }
  }, {});
  return {
    messages,
  };
});
