'use client';
import { getSyncStatus } from '@/utils/app/actions';
import { useEffect, useState } from 'react';

const Notice = ({ sync }: { sync: boolean }) => {
  const [isSynced, setIsSynced] = useState(sync ?? true);
  useEffect(() => {
    const fetchSyncStatus = async () => {
      try {
        const resp = await getSyncStatus();
        const syncStatus = resp?.jobs?.daily_stats?.sync;
        if (syncStatus != undefined) {
          setIsSynced(syncStatus);
        }
      } catch (error) {
        console.error('Failed to fetch sync status:', error);
      }
    };

    fetchSyncStatus();

    const intervalId = setInterval(fetchSyncStatus, 180000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isSynced) return null;

  return (
    <div className="flex flex-wrap">
      <div className="flex items-center justify-center text-center w-full border-b-2 border-nearblue dark:border-black-200 bg-nearblue dark:bg-black-200 py-2 text-green dark:text-green-250 text-sm">
        This blockchain explorer is out of sync. Some charts may be delayed.
      </div>
    </div>
  );
};

export default Notice;
