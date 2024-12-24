'use client';

import React from 'react';

import BalanceSkeleton from '@/components/app/skeleton/address/balance';
import TabSkeletion from '@/components/app/skeleton/address/tab';

export default function Error({ error, reset }: any) {
  React.useEffect(() => {
    console.log('logging error:', error);
  }, [error]);

  return (
    <>
      <BalanceSkeleton error />
      <div className="py-3"></div>
      <TabSkeletion error reset={reset} />
    </>
  );
}
