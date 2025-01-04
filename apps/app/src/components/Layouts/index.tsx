import { ReactNode, useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useRouter } from 'next/router';
import { BlocksInfo, Stats } from '@/utils/types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NextTopLoader from 'nextjs-toploader';
import { useTheme } from 'next-themes';

interface LayoutProps {
  children: ReactNode;
  notice?: ReactNode;
  statsDetails?: { stats: Stats[] };
  latestBlocks?: { blocks: BlocksInfo[] };
  signedAccountId?: string;
}

const Layout = ({
  children,
  notice,
  statsDetails,
  latestBlocks,
  signedAccountId,
}: LayoutProps) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          signedAccountId={signedAccountId as string}
        />
      </header>
      {isMounted && (
        <NextTopLoader color={`${theme === 'dark' ? '#31766A' : '#0d494a'}`} />
      )}
      <ToastContainer />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
