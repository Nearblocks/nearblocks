import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';

import { RPC } from 'nb-near';

import { getReceipt } from '@/libs/rpc';
import { useNetworkStore } from '@/stores/network';
import { useRpcStore } from '@/stores/rpc';

const Hash = () => {
  const router = useRouter();
  const { hash } = router.query;
  const rpcUrl = useRpcStore((state) => state.rpc);
  const providers = useNetworkStore((state) => state.providers);

  const rpc = useMemo(() => {
    return new RPC(rpcUrl || providers?.[0]?.url);
  }, [rpcUrl, providers]);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (typeof hash === 'string') {
        const receipt = await getReceipt(rpc, hash);
        if (receipt?.result) {
          router.push(`/txns/${receipt.result.transaction_hash}`);
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
