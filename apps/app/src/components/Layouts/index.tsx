import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useRouter } from 'next/router';
import { BlocksInfo, Stats } from '@/utils/types';
import useLoading from '@/hooks/useLoading';
import { Spinner } from '../common/Spinner';
import { ToastContainer } from 'react-toastify';

interface LayoutProps {
  children: ReactNode;
  notice?: ReactNode;
  statsDetails?: { stats: Stats[] };
  latestBlocks?: { blocks: BlocksInfo[] };
  searchResultDetails?: any;
  searchRedirectDetails?: any;
}

const Layout = ({
  children,
  notice,
  statsDetails,
  latestBlocks,
  searchResultDetails,
  searchRedirectDetails,
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
          statsDetails={statsDetails}
          latestBlocks={latestBlocks}
          searchResultDetails={searchResultDetails}
          searchRedirectDetails={searchRedirectDetails}
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
