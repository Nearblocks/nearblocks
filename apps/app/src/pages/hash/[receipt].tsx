import Layout from '@/components/Layouts';
import { networkId } from '@/utils/config';
import { ReactElement } from 'react';

const Receipt = () => null;
const fetcher = async (url: string, options: any) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {}
};
export const getServerSideProps = async (context: any) => {
  const {
    query: { receipt },
  } = context;

  const fetchData = async () => {
    try {
      const resp = await fetcher(
        networkId === 'mainnet'
          ? `https://api3.nearblocks.io/v1/search/receipts?keyword=${receipt}`
          : `https://api3-testnet.nearblocks.io/v1/search/receipts?keyword=${receipt}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return resp?.receipts?.[0]?.originated_from_transaction_hash;
    } catch (error) {
      return null;
    }
  };

  let txn = await fetchData();

  if (txn) {
    return {
      redirect: {
        permanent: false,
        destination: `/txns/${txn}`,
      },
    };
  }

  return {
    notFound: true,
  };
};

Receipt.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Receipt;
