'use client';
import React from 'react';

import Chart from '@/components/app/ApiUsage/Chart';
import ApiUsageStats from '@/components/app/ApiUsage/Stats';
import UserLayout from '@/components/app/Layouts/UserLayout';

import withAuth from '@/components/app/stores/withAuth';

const ApiUse = ({ id, role }: { id?: string; role?: string }) => {
  return (
    <>
      <UserLayout role={role} title="Api Key Usage">
        <>
          <ApiUsageStats keyId={id} />
          <div className="mt-8">
            <div className="container-xxl mx-auto">
              <div className="block bg-white dark:bg-black-600 border soft-shadow rounded-xl overflow-hidden mb-10">
                <Chart keyId={id} />
              </div>
            </div>
          </div>
        </>
      </UserLayout>
    </>
  );
};

export default withAuth(ApiUse);
