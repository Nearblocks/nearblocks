import RootLayout from './[lang]/layout';
import NotFound from './[lang]/not-found';
import './globals.css';

const GlobalNotFound = async ({ params }: LayoutProps<'/[lang]'>) => {
  return (
    <RootLayout params={params}>
      <NotFound />
    </RootLayout>
  );
};

export default GlobalNotFound;
