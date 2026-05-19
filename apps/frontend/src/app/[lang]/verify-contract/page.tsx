import type { Metadata } from 'next';

import { VerifyContract } from '@/components/address/contract/verifier';
import { fetchContract } from '@/data/address/contract';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/verify-contract'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'address');

  return {
    alternates: { canonical: '/verify-contract' },
    description: t('verifyContract.meta.description'),
    title: t('verifyContract.meta.title'),
  };
};

const VerifyContractPage = async ({ params, searchParams }: Props) => {
  const [{ lang }, sp] = await Promise.all([params, searchParams]);
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'address');
  const account = typeof sp.account === 'string' ? sp.account : undefined;
  const contract = account ? await fetchContract(account) : null;

  return (
    <main className="flex flex-1 flex-col py-10">
      <div className="container mx-auto px-4">
        <VerifyContract
          account={account}
          codeHash={contract?.code_hash ?? null}
          heading={t('verifyContract.title')}
        />
      </div>
    </main>
  );
};

export default VerifyContractPage;
