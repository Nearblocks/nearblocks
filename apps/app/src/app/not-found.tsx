import Error from '@/components/app/Error';
import Layout from '@/components/app/Layouts/Layout';
import { routing } from '@/i18n/routing';

export default function NotFound() {
  return (
    <Layout locale={routing.defaultLocale}>
      <Error />
    </Layout>
  );
}
