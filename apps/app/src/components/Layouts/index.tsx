import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useLoading from '@/hooks/useLoading';
import { BlocksInfo, Stats } from '@/utils/types';

import { Spinner } from '../common/Spinner';
import Footer from './Footer';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  latestBlocks?: { blocks: BlocksInfo[] };
  notice?: ReactNode;
  searchRedirectDetails?: any;
  searchResultDetails?: any;
  statsDetails?: { stats: Stats[] };
}

const Layout = ({
  children,
  latestBlocks,
  notice,
  searchRedirectDetails,
  searchResultDetails,
  statsDetails,
}: LayoutProps) => {
  const router = useRouter();
  const { loading, setLoading } = useLoading();
  const className =
    router.pathname === '/404'
      ? 'bg-white dark:bg-black-300'
      : 'bg-neargray-25 dark:bg-black-300	';

  return (
    <div className={className}>
      {notice}
      <header>
        <Header
          latestBlocks={latestBlocks}
          searchRedirectDetails={searchRedirectDetails}
          searchResultDetails={searchResultDetails}
          statsDetails={statsDetails}
        />
      </header>
      {loading && <Spinner loading={loading} setLoading={setLoading} />}
      <ToastContainer />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
