import { useEffect, useState } from 'react';

const useIndexedDB = (dbName: string, storeName: string, searchKey: string) => {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const request = indexedDB.open(dbName, 1);

      request.onsuccess = function () {
        const db = request.result;
        if (db.objectStoreNames.contains(storeName)) {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const getReq = store.getAllKeys();

          getReq.onsuccess = function () {
            getReq.result.forEach((key: any) => {
              const obj = JSON.parse(key);
              if (
                obj &&
                obj.action === 'LocalStorage' &&
                obj.key === searchKey
              ) {
                const getObjectReq = store.get(key);
                getObjectReq.onsuccess = function () {
                  setValue(getObjectReq.result);
                  setLoading(false);
                };
                getObjectReq.onerror = function (event: any) {
                  console.error(
                    'Get object request error:',
                    event.target.error,
                  );
                  setLoading(false);
                };
              }
            });
          };

          getReq.onerror = function (event: any) {
            console.error('Get request error:', event.target.error);
            setLoading(false);
          };
        } else {
          console.error(`Object store ${storeName} not found`);
          setLoading(false);
        }
      };

      request.onerror = function (event: any) {
        console.error('Database error:', event.target.error);
        setLoading(false);
      };
    }
  }, [dbName, storeName, searchKey]);

  return { value, loading };
};

export default useIndexedDB;
