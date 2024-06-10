import { useEffect } from 'react';

import config from '@/config';
import { useWidgetStore } from '@/stores/widgets';

const isDev = !!process && process.env.NODE_ENV === 'development';

const fetchData = async () => {
  const res = await fetch(config.loaderUrl, {
    headers: {
      Accept: 'application/json',
    },
    method: 'GET',
  });

  const data = await res.json();

  if (data?.components?.constructor === Object) {
    useWidgetStore.setState({ widgets: data.components });
  }
};

export const useLoadWidgets = () => {
  useEffect(() => {
    if (isDev && config.loaderUrl) {
      fetchData().catch(console.log);
    }
  }, []);
};
