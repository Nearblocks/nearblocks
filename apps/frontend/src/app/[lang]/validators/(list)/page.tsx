import { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { Validators } from '@/components/validators';
import { fetchStats } from '@/data/layout';
import { fetchValidatorInfo, fetchValidatorList } from '@/data/validators';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/validators'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'validators');

  return {
    alternates: { canonical: '/validators' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const ValidatorsPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;
  const validatorListPromise = fetchValidatorList(filters);
  const validatorInfoPromise = fetchValidatorInfo();
  const statsPromise = fetchStats();
  await holdNav();

  return (
    <ErrorSuspense fallback={<Validators loading />}>
      <Validators
        statsPromise={statsPromise}
        validatorInfoPromise={validatorInfoPromise}
        validatorListPromise={validatorListPromise}
      />
    </ErrorSuspense>
  );
};

export default ValidatorsPage;
