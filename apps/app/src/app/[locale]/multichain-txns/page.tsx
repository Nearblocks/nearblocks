import MultiChainTxns from '@/components/app/ChainAbstraction/MultiChainTxns';
// import Stats from '@/components/app/ChainAbstraction/Stats';
import { getRequestBeta } from '@/utils/app/api';
import {
  //  McTxnsCountRes,
  McTxnsReq,
} from 'nb-schemas';

export default async function TransactionList(props: {
  searchParams: Promise<McTxnsReq>;
}) {
  const searchParams = await props.searchParams;
  // Temporary: Restrict query to timestamp before 1753508902039944556
  // Reason: Base indexer (1 week behind) and receipts indexer (1 day behind) are out of sync
  // TODO: Remove this restriction after indexers are fully synced
  const finalParams = {
    before_ts: '1753508902039944556',
    ...searchParams,
  };

  const apiUrl = `v3/multichain/signatures`;
  const countUrl = `${apiUrl}/count`;
  // const chartUrl = `v1/charts`;
  const data = getRequestBeta(apiUrl, finalParams);
  const count = getRequestBeta(countUrl, finalParams);
  // const dataChart = getRequest(chartUrl);

  // const today = new Date();
  // const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  // const beforeDate = (today.getTime() * 1000000).toString();
  // const afterDate = (yesterday.getTime() * 1000000).toString();

  // const dataTxnsTotalCount: Promise<McTxnsCountRes> = getRequest(countUrl, {
  //   account: searchParams?.account,
  // });
  // const dataTxns24HrCount: Promise<McTxnsCountRes> = getRequest(countUrl, {
  //   after_ts: afterDate,
  //   before_ts: beforeDate,
  //   account: searchParams?.account,
  // });

  return (
    <>
      {/* <Stats
        dataChartPromise={dataChart}
        error={!data}
        txns24HrCountPromise={dataTxns24HrCount}
        txnsTotalCountPromise={dataTxnsTotalCount}
      />
      <div className="py-6"></div> */}
      <MultiChainTxns
        dataPromise={data}
        countPromise={count}
        isTab={false}
        tab={''}
      />
      <div className="py-8"></div>
    </>
  );
}
