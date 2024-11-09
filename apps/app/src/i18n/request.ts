import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
  if (!routing.locales.includes(locale as any)) notFound();

  const [
    commonMessages,
    homeMessages,
    blockMessages,
    txnsMessages,
    addressMessages,
    chartsMessages,
    tokenMessages,
    contactMessages,
    topAccountsMessages,
    termsMessages,
    claimAddressMessages,
    kbMessages,
    notFoundMessages,
  ] = await Promise.all([
    import(`nearblocks-trans-next-intl/${locale}/common.json`),
    import(`nearblocks-trans-next-intl/${locale}/home.json`),
    import(`nearblocks-trans-next-intl/${locale}/blocks.json`),
    import(`nearblocks-trans-next-intl/${locale}/txns.json`),
    import(`nearblocks-trans-next-intl/${locale}/address.json`),
    import(`nearblocks-trans-next-intl/${locale}/charts.json`),
    import(`nearblocks-trans-next-intl/${locale}/token.json`),
    import(`nearblocks-trans-next-intl/${locale}/contact.json`),
    import(`nearblocks-trans-next-intl/${locale}/top-accounts.json`),
    import(`nearblocks-trans-next-intl/${locale}/terms.json`),
    import(`nearblocks-trans-next-intl/${locale}/claim-address.json`),
    import(`nearblocks-trans-next-intl/${locale}/kb.json`),
    import(`nearblocks-trans-next-intl/${locale}/404.json`),
  ]);

  const messages = {
    ...commonMessages.default,
    ...homeMessages.default,
    ...blockMessages.default,
    ...addressMessages.default,
    ...txnsMessages.default,
    ...chartsMessages.default,
    ...tokenMessages.default,
    ...contactMessages.default,
    ...topAccountsMessages.default,
    ...termsMessages.default,
    ...claimAddressMessages.default,
    ...kbMessages.default,
    ...notFoundMessages.default,
  };

  return {
    messages,
  };
});
