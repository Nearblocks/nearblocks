import { apiUrl } from '@/utils/config';
import React, { useEffect, useState } from 'react';

const Notice = () => {
  const [status, setStatus] = useState(true);
  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch(`${apiUrl}sync/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const dataArray = await response.json();
        const data: any = dataArray?.status?.jobs?.daily_stats?.sync;
        if (response.status === 200) {
          setStatus(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
      }
    }

    fetchToken();
  }, []);
  return !status ? (
    <div className="flex flex-wrap">
      <div className="flex items-center justify-center text-center w-full  border-b-2 border-nearblue bg-nearblue py-2 text-green text-sm ">
        This blockchain explorer is out of sync. Some charts may be delayed.
      </div>
    </div>
  ) : null;
};
export default Notice;
