import Error from '@/components/Error';
import Layout from '@/components/Layouts';
import { fetchData } from '@/utils/fetchData';
import { GetStaticProps, GetStaticPropsContext } from 'next';
import { ReactElement } from 'react';

export const getStaticProps: GetStaticProps<{
  statsDetails: any;
  latestBlocks: any;
  searchResultDetails: any;
  searchRedirectDetails: any;
}> = async (context: GetStaticPropsContext) => {
  const { params } = context;

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

    return {
      props: {
        statsDetails,
        latestBlocks,
        searchResultDetails,
        searchRedirectDetails,
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

export default NotFound;
