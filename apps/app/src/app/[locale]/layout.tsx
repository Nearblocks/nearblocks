import { unstable_setRequestLocale } from 'next-intl/server';

import Layout from '@/components/app/Layouts/Layout';

export default async function ProviderLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  return <Layout locale={locale}>{children}</Layout>;
}
