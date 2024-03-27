import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  notice?: ReactNode;
}

const Layout = ({ children, notice }: LayoutProps) => {
  const router = useRouter();
  const className = router.pathname === '/404' ? 'bg-white' : 'bg-neargray-25';

  return (
    <div className={className}>
      {notice}
      <header>
        <Header />
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
