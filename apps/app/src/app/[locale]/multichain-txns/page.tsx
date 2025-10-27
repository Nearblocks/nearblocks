import MultiChainTxns from '@/components/app/ChainAbstraction/MultiChainTxns';
// import Stats from '@/components/app/ChainAbstraction/Stats';
import { getRequestBeta } from '@/utils/app/api';
import {
  //  McTxnsCountRes,
  MCTxnsReq,
} from 'nb-schemas';

export default async function TransactionList(props: {
  searchParams: Promise<MCTxnsReq>;
}) {
  const searchParams = await props.searchParams;

  const apiUrl = `v3/multichain/signatures`;
  const countUrl = `${apiUrl}/count`;
  // const chartUrl = `v1/charts`;
  const data = getRequestBeta(apiUrl, searchParams);
  const count = getRequestBeta(countUrl, searchParams);
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
