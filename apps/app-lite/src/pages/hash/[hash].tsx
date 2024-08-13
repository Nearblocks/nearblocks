import { GetServerSideProps } from 'next';

import { RPC } from 'nb-near';

import { getReceipt } from '@/libs/rpc';
import { useNetworkStore } from '@/stores/network';

const network = useNetworkStore.getState().network;

const rpc =
  network === 'mainnet'
    ? new RPC('https://beta.rpc.mainnet.near.org')
    : new RPC('https://beta.rpc.testnet.near.org');

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
