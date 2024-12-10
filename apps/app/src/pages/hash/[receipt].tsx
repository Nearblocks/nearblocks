import Layout from '@/components/Layouts';
import { apiUrl, networkId } from '@/utils/config';
import { getReceipt } from '@/utils/rpc';
import { ReactElement } from 'react';

const Receipt = () => null;

const receiptRpc =
  networkId === 'mainnet'
    ? `https://beta.rpc.mainnet.near.org`
    : `https://beta.rpc.testnet.near.org')`;

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
        `${apiUrl}search/receipts?keyword=${receipt}`,
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

  if (!txn) {
    try {
      const rpcResponse = await getReceipt(receiptRpc, receipt);
      if (rpcResponse) {
        txn = rpcResponse?.parent_transaction_hash;
      }
    } catch (rpcError) {
      console.log('RPC call failed:', rpcError);
      return {
        notFound: true,
      };
    }
  }

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
