import { Footer } from './footer';
import { Header } from './header';
import { TopBar } from './topbar';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export const Layout = ({ children }: Props) => {
  return (
    <>
      {/* <Notice /> */}
      <TopBar />
      <Header />
      {children}
      <Footer />
    </>
  );
};
