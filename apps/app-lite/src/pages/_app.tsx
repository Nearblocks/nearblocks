import type { AppProps } from 'next/app';

import { useLoadWidgets } from '@/hooks/useLoadWidgets';
import { useTheme } from '@/hooks/useTheme';
import '@/styles/globals.css';
import { PageLayout } from '@/types/types';

type Props = AppProps & {
  Component: PageLayout;
};

const App = ({ Component, pageProps }: Props) => {
  useTheme();
  useLoadWidgets();

  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(<Component {...pageProps} />);
};

export default App;
