import type { Metadata } from 'next';

import { AccountBalanceForm } from '@/components/tools/account-balance/form';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/account-balance'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'tools');

  return {
    alternates: { canonical: '/account-balance' },
    description: t('balance.subtitle'),
    title: t('balance.title'),
  };
};

const AccountBalancePage = async () => {
  return (
    <div>
      <AccountBalanceForm />
    </div>
  );
};

export default AccountBalancePage;
