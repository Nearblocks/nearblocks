import { getRequestBeta } from '@/utils/app/api';

import ListActions from '@/components/app/Transactions/ListActions';

const List = async ({ searchParams }: any) => {
  const [data, count] = await Promise.all([
    getRequestBeta(`v3/txns`, searchParams),
    getRequestBeta(`v3/txns/count`, searchParams),
  ]);
  if (data?.errors) {
    throw new Error(`Server Error :  ${data?.errors[0].message}`);
  }

  return <ListActions error={!data} txnsCount={count} txnsData={data} />;
};
export default List;
