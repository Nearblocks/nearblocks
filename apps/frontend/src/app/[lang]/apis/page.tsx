import { Metadata } from 'next';

import { Apis } from '@/components/apis';
import { fetchPlans } from '@/data/plans';
import { hasLocale, translator } from '@/locales/dictionaries';
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert';

const MIGRATION_URL = 'https://api.nearblocks.io/api-docs/migration';

export const generateMetadata = async ({
  params,
}: PageProps<'/[lang]/apis'>): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'apis');

  return {
    alternates: { canonical: '/apis' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const ApisPage = async () => {
  const plansPromise = fetchPlans();
  return (
    <main className="flex flex-1 flex-col">
      <div className="container mx-auto px-4 pt-4">
        <Alert>
          <AlertTitle>API v3 is now live</AlertTitle>
          <AlertDescription>
            <p>
              API v1 and v2 are deprecated and will be removed in a future
              release. Port existing integrations using the{' '}
              <a
                className="text-primary font-medium underline underline-offset-2"
                href={MIGRATION_URL}
                rel="noopener noreferrer"
                target="_blank"
              >
                v1/v2 → v3 migration guide
              </a>
              .
            </p>
          </AlertDescription>
        </Alert>
      </div>
      <Apis plansPromise={plansPromise} />
    </main>
  );
};

export default ApisPage;
