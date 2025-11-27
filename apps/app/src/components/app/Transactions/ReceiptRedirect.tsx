'use client';

import { useEffect, useState } from 'react';
import { useIntlRouter } from '@/i18n/routing';
import { rpcSearchClient } from '@/utils/app/rpcClient';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import FileSlash from '@/components/app/Icons/FileSlash';
import CircularLoader from '@/components/app/skeleton/common/CircularLoader';

const ReceiptRedirect = ({ receipt }: { receipt: string }) => {
  const router = useIntlRouter();
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const res = await rpcSearchClient(receipt);
      if (!active) return;

      const data = res?.data;
      const txnHash = data?.txns?.[0]?.transaction_hash;

      if (txnHash && router) {
        router.push(`/txns/${txnHash}`);
        return;
      }
      setLoading(false);
      setNotFound(true);
    })();
    return () => {
      active = false;
    };
  }, [receipt, router]);

  if (loading) {
    return (
      <div className="container-xxl mx-auto px-5 pt-10">
        <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 px-5">
          <div className="flex items-center justify-center py-10">
            <CircularLoader />
          </div>
        </div>
        <div className="py-8"></div>
      </div>
    );
  }

  if (!notFound) return null;

  return (
    <div className="container-xxl mx-auto px-5 pt-10">
      <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 px-5">
        <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
          <ErrorMessage
            icons={<FileSlash />}
            message="Sorry, we are unable to locate this receipt hash. Please try again later."
            mutedText={receipt || ''}
          />
        </div>
      </div>
      <div className="py-8"></div>
    </div>
  );
};

export default ReceiptRedirect;
