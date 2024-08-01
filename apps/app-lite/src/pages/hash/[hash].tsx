import { GetServerSideProps } from 'next';

import { RPC } from 'nb-near';

import { getReceipt } from '@/libs/rpc';
import { useNetworkStore } from '@/stores/network';

const providers = useNetworkStore.getState().providers;

const rpcUrl = providers[0].url;
const rpc = new RPC(rpcUrl);

export const getServerSideProps = (async (context) => {
  const {
    query: { hash },
  } = context;

  if (typeof hash === 'string') {
    const receipt = await getReceipt(rpc, hash);

    if (receipt?.result) {
      return {
        redirect: {
          destination: `/txns/${receipt.result.parent_transaction_hash}`,
          permanent: false,
        },
      };
    }
  }

  return {
    notFound: true,
  };
}) satisfies GetServerSideProps;

const Hash = () => null;

export default Hash;
