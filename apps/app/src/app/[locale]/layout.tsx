import Layout from '@/components/app/Layouts/Layout';

export default async function ProviderLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  return <Layout locale={locale}>{children}</Layout>;
}
