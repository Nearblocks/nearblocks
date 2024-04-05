import Head from 'next/head';
import { useRouter } from 'next/router';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { apiUrl, networkId, appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Overview from '@/components/skeleton/ft/Overview';
import Router from 'next/router';

import Layout from '@/components/Layouts';
import { ReactElement, useEffect, useRef, useState } from 'react';

const ogUrl = process.env.NEXT_PUBLIC_OG_URL;
const network = process.env.NEXT_PUBLIC_NETWORK_ID;

const Token = () => {
  const router = useRouter();
  const { id, a } = router.query;
  const components = useBosComponents();
  const { t } = useTranslation();
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [token, setToken] = useState<{ name: string; symbol: string } | null>(
    null,
  );

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch(`${apiUrl}fts/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const dataArray = await response.json();
        const data: any = dataArray?.contracts?.[0];
        if (response.status === 200) {
          setToken(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
      }
    }

    fetchToken();
  }, [id]);

  const title = `${network === 'testnet' ? 'TESTNET ' : ''}${
    token ? `${token.name} (${token.symbol}) ` : ''
  }Stats, Price, Holders & Transactions | NearBlocks`;
  const description = token
    ? `All ${token.name} (${token.symbol}) information in one place : Statistics, price, market-cap, total & circulating supply, number of holders & latest transactions`
    : '';
  const thumbnail = `${ogUrl}/thumbnail/token?token=${token?.name}&network=${network}`;

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
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/token/${id}}`} />
      </Head>
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
          loading={<Overview className="absolute pr-6" ref={heightRef} />}
        />
        <div className="py-8"></div>
      </div>
    </>
  );
};

Token.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Token;
