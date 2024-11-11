import { getRequest } from '@/utils/app/api';
import ListActions from './ListActions';

const List = async ({
  searchParams,
}: {
  searchParams: { cursor?: string; p?: string; order: string };
}) => {
  const options = {
    cache: 'no-store',
  };
  const [data, count] = await Promise.all([
    getRequest(`txns`, searchParams, options),
    getRequest(`txns/count`, {}, options),
  ]);

  return (
    <ListActions
      txnsData={data}
      txnsCount={count}
      error={!data || data === null}
    />
  );
};
export default List;
