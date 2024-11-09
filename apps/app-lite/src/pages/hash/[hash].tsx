import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';

import { RPC } from 'nb-near';

import { getReceipt } from '@/libs/rpc';
import { useNetworkStore } from '@/stores/network';

const Hash = () => {
  const router = useRouter();
  const { hash } = router.query;
  const network = useNetworkStore.getState().network;

  const rpc = useMemo(() => {
    return network === 'mainnet'
      ? new RPC('https://beta.rpc.mainnet.near.org')
      : new RPC('https://beta.rpc.testnet.near.org');
  }, [network]);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (typeof hash === 'string') {
        const receipt = await getReceipt(rpc, hash);
        if (receipt?.result) {
          router.push(`/txns/${receipt.result.parent_transaction_hash}`);
        } else {
          router.push('/'); // TODO add 404 page
        }
      }
    };

    fetchAndRedirect();
  }, [hash, rpc, router]);

  return null;
};

export default Hash;
