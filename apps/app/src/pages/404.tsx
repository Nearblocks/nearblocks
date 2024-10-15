import Error from '@/components/Error';
import Layout from '@/components/Layouts';
import { fetchData } from '@/utils/fetchData';
import { GetStaticProps } from 'next';
import { ReactElement } from 'react';

export const getStaticProps: GetStaticProps<{
  statsDetails: any;
  latestBlocks: any;
}> = async () => {
  try {
    const { statsDetails, latestBlocks } = await fetchData();

    return {
      props: {
        statsDetails,
        latestBlocks,
      },
    };
  } catch (error) {
    console.error('Error fetching charts:', error);

    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const NotFound = () => <Error />;

NotFound.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default NotFound;
