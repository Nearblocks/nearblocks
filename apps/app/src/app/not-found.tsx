import Layout from '@/components/app/Layouts/Layout';
import Error from '@/components/Error';
import { routing } from '@/i18n/routing';

export default function NotFound() {
  return (
    <Layout locale={routing.defaultLocale}>
      <Error />
    </Layout>
  );
}
