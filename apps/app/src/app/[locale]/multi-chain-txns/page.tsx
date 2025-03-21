import MultiChainTxns from '@/components/app/ChainAbstraction/MultiChainTxns';
import Stats from '@/components/app/ChainAbstraction/Stats';
import { getRequest } from '@/utils/app/api';
import { chain } from '@/utils/app/config';

export default async function TransactionList(props: {
  searchParams: Promise<{
    from?: string;
    multichain_address?: string;
    order: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const apiUrl = `v1/chain-abstraction/txns`;
  const countUrl = `${apiUrl}/count`;
  const chartUrl = `v1/charts`;
  const today = new Date();
  const beforeDate = today.toISOString().split('T')[0];
  const afterDate = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [data, dataCount, dataTxnsTotalCount, dataTxns24HrCount, dataChart] =
    await Promise.all([
      getRequest(apiUrl, searchParams),
      getRequest(countUrl, searchParams),
      getRequest(countUrl),
      getRequest(countUrl, { after_date: afterDate, before_date: beforeDate }),
      getRequest(chartUrl),
    ]);

  const count = dataCount?.txns[0]?.count;
  const txns = data?.txns;
  let cursor = data?.cursor;

  const txnsTotalCount = dataTxnsTotalCount?.txns[0]?.count;
  const txns24HrCount = dataTxns24HrCount?.txns[0]?.count;
  const networksCount = Object.keys(chain).length;

  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }

  return (
    <>
      <Stats
        dataChart={dataChart}
        error={!data}
        networksCount={networksCount}
        txns24HrCount={txns24HrCount}
        txnsTotalCount={txnsTotalCount}
      />
      <div className="py-6"></div>
      <MultiChainTxns
        count={count}
        cursor={cursor}
        error={!data}
        isTab={false}
        tab={''}
        txns={txns}
      />
      <div className="py-8"></div>
    </>
  );
}
