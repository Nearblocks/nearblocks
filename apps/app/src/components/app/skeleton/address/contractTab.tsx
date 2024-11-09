import React from 'react';
import { TabList, TabPanel, Tabs } from 'react-tabs';

import Skeleton from '../common/Skeleton';

export default function ContractTabSleleton() {
  return (
    <Tabs className={'pb-1 px-4 py-3'}>
      <TabList className={'flex flex-wrap'}>
        <Skeleton className="w-24 h-8 mr-2" />
        <Skeleton className="w-24 h-8" />
      </TabList>
      <TabPanel>
        <div className="p-4">
          <Skeleton className="w-full h-6 mb-4" />
          <Skeleton className="w-full h-20 mb-4" />
          <Skeleton className="w-full h-12" />
        </div>
      </TabPanel>
      <TabPanel>
        <div className="border-t p-4 mt-3">
          <Skeleton className="w-32 h-8 mb-4" />
          <Skeleton className="w-full h-6 mb-2" />
          <Skeleton className="w-full h-6 mb-2" />
          <Skeleton className="w-full h-6 mb-2" />
        </div>
      </TabPanel>
    </Tabs>
  );
}
