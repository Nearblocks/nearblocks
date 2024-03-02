import { useRouter } from 'next/router';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Overview from '@/components/skeleton/ft/Overview';
import Router from 'next/router';

import Layout from '@/components/Layouts';
import { ReactElement, useEffect, useRef, useState } from 'react';
const Token = () => {
  const router = useRouter();
  const { id, a } = router.query;
  const components = useBosComponents();
  const { t } = useTranslation();
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const filtersFromURL: { [key: string]: string } = {};

    for (const [key, value] of queryParams.entries()) {
      if (key !== 'page') {
        filtersFromURL[key] = value;
      }
    }

    if (Object.keys(filtersFromURL).length > 0) {
      setFilters(filtersFromURL);
    }
  }, []);

  const updateURL = (params: { [key: string]: string | number }) => {
    const queryString = Object.keys(params)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(
            params[key].toString(),
          )}`,
      )
      .join('&');

    const url = `/token/${id}/${queryString ? `?${queryString}` : ''}`;
    Router.push(url);
  };

  const onFilterClear = (name: string) => {
    let updatedFilters = { ...filters };
    if (updatedFilters.hasOwnProperty(name)) {
      delete updatedFilters[name];
      setFilters(updatedFilters);

      updateURL({ ...updatedFilters });
    } else {
      updatedFilters = {};
      setFilters(updatedFilters);
      updateURL({ ...updatedFilters });
    }
  };

  const filtersObject = filters ? filters : {};

  const updateOuterDivHeight = () => {
    if (heightRef.current) {
      const Height = heightRef.current.offsetHeight;
      setHeight({ height: Height });
    } else {
      setHeight({});
    }
  };
  useEffect(() => {
    updateOuterDivHeight();
    window.addEventListener('resize', updateOuterDivHeight);

    return () => {
      window.removeEventListener('resize', updateOuterDivHeight);
    };
  }, []);
  const onChangeHeight = () => {
    setHeight({});
  };

  return (
    <div style={height} className="relative container mx-auto px-3">
      <VmComponent
        skeleton={<Overview className="absolute pr-6" ref={heightRef} />}
        defaultSkelton={<Overview />}
        onChangeHeight={onChangeHeight}
        src={components?.ftOverview}
        props={{
          network: networkId,
          t: t,
          id: id,
          tokenFilter: a,
          filters: filtersObject,
          onFilterClear: onFilterClear,
        }}
      />
      <div className="py-8"></div>
    </div>
  );
};

Token.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Token;
