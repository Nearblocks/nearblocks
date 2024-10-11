import { getRequest } from '@/utils/app/api';
import ListActions from './ListActions';

const List = async ({ searchParams }: any) => {
  const [data, count] = await Promise.all([
    getRequest(`txns`, searchParams),
    getRequest(`txns/count`, searchParams),
  ]);

  return (
    <>
      <ListActions
        txnsData={data}
        txnsCount={count}
        error={!data || data === null}
      />
    </>
  );
};
export default List;
