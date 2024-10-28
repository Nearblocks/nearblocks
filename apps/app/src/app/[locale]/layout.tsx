import Layout from '@/components/app/Layouts/Layout';
import { unstable_setRequestLocale } from 'next-intl/server';

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
