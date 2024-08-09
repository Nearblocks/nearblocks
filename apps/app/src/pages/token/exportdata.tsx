import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import Export from '@/components/Export';

const ExportData = () => {
  const router = useRouter();
  const { address } = router.query;

  const title = 'Export Token Transactions Data | Nearblocks';

  const onHandleDowload = (blobUrl: string, file: string): void => {
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.setAttribute('download', file);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta property="og:title" content={title} />
        <meta property="twitter:title" content={title} />
        <link rel="canonical" href={`${appUrl}/token/exportdata`} />
      </Head>
      <div className="relative">
        <Export
          id={address}
          onHandleDowload={onHandleDowload}
          exportType={'Token Transactions'}
        />
      </div>
    </>
  );
};

ExportData.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default ExportData;
