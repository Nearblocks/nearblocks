import Error from '@/components/Error';
import Layout from '@/components/Layouts';
import { ReactElement } from 'react';

const NotFound = () => <Error />;

NotFound.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default NotFound;
