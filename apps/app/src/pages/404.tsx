import Error from '@/components/Error';
import Layout from '@/components/Layouts';
import { fetchData } from '@/utils/fetchData';
import { pick } from 'lodash';
import { GetStaticProps, GetStaticPropsContext } from 'next';
import { ReactElement } from 'react';

export const getStaticProps: GetStaticProps<{
  statsDetails: any;
  latestBlocks: any;
  searchResultDetails: any;
  searchRedirectDetails: any;
}> = async (context: GetStaticPropsContext) => {
  const { params } = context;
  const currentLocale = context?.params?.locale || 'en';

  const keyword: any = params?.keyword ?? '';
  const query: any = params?.query ?? '';
  const filter: any = params?.filter ?? 'all';

  const key = keyword && keyword?.replace(/[\s,]/g, '');
  const q = query && query?.replace(/[\s,]/g, '');

  try {
    const {
      statsDetails,
      latestBlocks,
      searchResultDetails,
      searchRedirectDetails,
    } = await fetchData(q, key, filter);

    const [notFoundMessages, commonMessages] = await Promise.all([
      import(`nearblocks-trans-next-intl/${currentLocale}/404.json`),
      import(`nearblocks-trans-next-intl/${currentLocale}/common.json`),
    ]);

    const messages = {
      ...pick(notFoundMessages.default, NotFound.messages),
      ...commonMessages.default,
    };

    return {
      props: {
        statsDetails,
        latestBlocks,
        searchResultDetails,
        searchRedirectDetails,
        messages,
      },
    };
  } catch (error) {
    console.error('Error fetching charts:', error);

    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
        searchResultDetails: null,
        searchRedirectDetails: null,
        messages: null,
      },
    };
  }
};

const NotFound = () => <Error />;

NotFound.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    searchResultDetails={page?.props?.searchResultDetails}
    searchRedirectDetails={page?.props?.searchRedirectDetails}
  >
    {page}
  </Layout>
);

NotFound.messages = ['404', 'common'];

export default NotFound;
