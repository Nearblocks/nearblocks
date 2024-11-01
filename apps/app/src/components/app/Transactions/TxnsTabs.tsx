import { Link } from '@/i18n/routing';
import classNames from 'classnames';
import Details from '@/components/app/Transactions/Details';
import Receipt from '@/components/app/Transactions/Receipt';
import Execution from '@/components/app/Transactions/Execution';
import Tree from '@/components/app/Transactions/Tree';
import ReceiptSummary from '@/components/app/Transactions/ReceiptSummary';
import { getRequest } from '@/utils/app/api';
import { nanoToMilli } from '@/utils/app/libs';

export default async function TxnsTabs({
  hash,
  searchParams,
}: {
  hash: string;
  locale: string;
  searchParams: any;
}) {
  const data = (await getRequest(`txns/${hash}`)) || {};
  const txn = data?.txns?.[0];
  let price: number | null = null;
  if (txn?.block_timestamp) {
    const timestamp = new Date(nanoToMilli(txn.block_timestamp));
    const currentDate = new Date();
    const currentDt = currentDate.toISOString().split('T')[0];
    const blockDt = timestamp.toISOString().split('T')[0];

    if (currentDt > blockDt) {
      const priceData = (await getRequest(`stats/price?date=${blockDt}`)) || {};
      price = priceData?.stats?.[0]?.near_price || null;
    }
  }

  let isContract = null;
  if (txn?.receiver_account_id) {
    const [contractResult] = await Promise.allSettled([
      getRequest(`account/${txn?.receiver_account_id}`),
    ]);

    isContract =
      contractResult.status === 'fulfilled' ? contractResult.value : null;
  }

  const tab = searchParams?.tab || 'overview';

  const tabs = [
    { name: 'overview', message: 'txn.tabs.overview', label: 'Overview' },
    {
      name: 'execution',
      message: 'txn.tabs.execution',
      label: 'Execution Plan',
    },
    { name: 'enhanced', message: 'tokenTxns', label: 'Enhanced Plan' },
    { name: 'tree', message: 'nftTokenTxns', label: 'Tree Plan' },
    { name: 'summary', message: 'accessKeys', label: 'Reciept Summary' },
  ];

  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
        'bg-green-600 dark:bg-green-250 text-white': selected,
      },
    );

  return (
    <>
      <div className="relative container mx-auto px-3">
        <>
          <div className="md:flex justify-between">
            <div className="w-fit md:flex md:gap-2">
              {tabs?.map(({ name, label }) => {
                return (
                  <Link
                    key={name}
                    href={
                      name === 'overview'
                        ? `/txns/${hash}`
                        : `/txns/${hash}?tab=${name}`
                    }
                    className={getClassName(name === tab)}
                  >
                    <h2>
                      {label}
                      {name === 'enhanced' && (
                        <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md  -mt-3 px-1">
                          NEW
                        </div>
                      )}
                    </h2>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl">
            {tab === 'overview' ? (
              <Details
                txn={txn}
                statsData={[]}
                loading={false}
                isContract={isContract}
                price={price ? String(price) : ''}
                hash={hash}
              />
            ) : null}

            {tab === 'execution' ? (
              <Receipt txn={txn} loading={false} hash={hash} />
            ) : null}

            {tab === 'enhanced' ? <Execution txn={txn} hash={hash} /> : null}
            {tab === 'tree' ? <Tree txn={txn} hash={hash} /> : null}
            {tab === 'summary' ? (
              <ReceiptSummary
                txn={txn}
                loading={false}
                price={price ? String(price) : ''}
                hash={hash}
              />
            ) : null}
          </div>
        </>
      </div>
      <div className="py-8"></div>
    </>
  );
}
