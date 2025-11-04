'use client';

import { useState } from 'react';

const AnalyticsTabActions = ({ tabPanels }: { tabPanels: any[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = [
    { label: 'Overview', name: 'overview' },
    { label: 'Balance', name: 'balance' },
    { label: 'Transactions', name: 'transactions' },
    { label: 'Txns Fees', name: 'txnsfees' },
    { label: 'Token Transfers', name: 'tokentransfers' },
  ];

  return (
    <div className={'pb-1 px-4 py-3'}>
      <div className={'flex flex-wrap gap-x-1 gap-y-2 pt-2'}>
        {tabs?.map((tab, index) => (
          <button
            key={tab.name}
            onClick={() => setActiveIndex(index)}
            className={`
              px-2.5 mr-1 border dark:border-black-200 py-1.5 text-xs font-semibold rounded-lg cursor-pointer outline-none 
              ${
                activeIndex === index
                  ? '!bg-green-600 dark:!bg-green-250 !text-white'
                  : 'text-nearblue-600 dark:text-neargray-10 hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 dark:hover:bg-black-100' // Inactive styles
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">{tabPanels[activeIndex]}</div>
    </div>
  );
};

export default AnalyticsTabActions;
