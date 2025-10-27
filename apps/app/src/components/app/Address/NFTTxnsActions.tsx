'use client';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import { use, useState } from 'react';

import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Link, usePathname, useIntlRouter } from '@/i18n/routing';
import { localFormat, truncateString } from '@/utils/libs';
import { FilterKind } from '@/utils/types';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import Filters from '@/components/app/common/Filters';
import TxnStatus from '@/components/app/common/Status';
import Table from '@/components/app/common/Table';
import TableSummary from '@/components/app/common/TableSummary';
import TokenImage from '@/components/app/common/TokenImage';
import Tooltip from '@/components/app/common/Tooltip';
import Clock from '@/components/app/Icons/Clock';
import Download from '@/components/app/Icons/Download';
import FaInbox from '@/components/app/Icons/FaInbox';
import Filter from '@/components/app/Icons/Filter';
import { getFilteredQueryParams } from '@/utils/app/libs';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';
import { CopyButton } from '@/components/app/common/CopyButton';
import Timestamp from '@/components/app/common/Timestamp';
import {
  AccountNFTTxn,
  AccountNFTTxnCountRes,
  AccountNFTTxnsRes,
} from 'nb-schemas';

interface NftTokenTxnsProps {
  dataPromise: Promise<AccountNFTTxnsRes>;
  countPromise: Promise<AccountNFTTxnCountRes>;
}

const NFTTransactionActions = ({
  dataPromise,
  countPromise,
}: NftTokenTxnsProps) => {
  const { data: txns, errors, meta } = use(dataPromise);
  const { data: countData } = use(countPromise);
  if (errors && errors.length > 0) {
    throw new Error(`Server Error : ${errors[0].message}`);
  }
  const count = countData?.count;
  const cursor = meta?.cursor;
  const error = !txns || txns === null;
  const router = useIntlRouter();
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const initialForm = {
    token: searchParams?.get('token') || '',
    involved: searchParams?.get('involved') || '',
    contract: searchParams?.get('contract') || '',
    after_ts: searchParams?.get('after_ts') || '',
    before_ts: searchParams?.get('before_ts') || '',
  };
  const [form, setForm] = useState(initialForm);
  const [showAge, setShowAge] = useState(true);
  const t = useTranslations();
  const errorMessage = t('noTxns') || ' No transactions found!';
  const toggleShowAge = () => setShowAge((s) => !s);
  const currentParams = QueryString.parse(searchParams?.toString() || '');

  const onChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;

    setForm((f) => ({ ...f, [name]: value }));
  };

  const onFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPage(1);

    const { token, involved, contract, after_ts, before_ts } = form;
    const { cursor, page, ...updatedQuery } = currentParams;

    const queryParams = {
      ...updatedQuery,
      ...(token && { token }),
      ...(involved && { involved }),
      ...(contract && { contract }),
      ...(after_ts && { after_ts }),
      ...(before_ts && { before_ts }),
    };

    const newQueryString = QueryString.stringify(queryParams);
    router.push(`${pathname}?${newQueryString}`);
  };

  const onClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = e.currentTarget;

    setPage(1);
    const { cursor, page, ...restQuery } = currentParams;

    setForm((f) => ({ ...f, [name]: '' }));
    const { [name]: _, ...newQuery } = restQuery;
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
  };

  const onAllClear = () => {
    setForm(initialForm);
    const {
      cursor,
      token,
      involved,
      contract,
      after_ts,
      before_ts,
      page,
      ...newQuery
    } = currentParams;
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
  };

  const columns = [
    {
      cell: () => (
        <>
          <TxnStatus showLabel={false} status={true} />
        </>
      ),
      header: '',
      key: '',
      tdClassName:
        'pl-5 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: AccountNFTTxn) => (
        <span>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row.transaction_hash}
          >
            <AddressOrTxnsLink
              copy
              className={
                'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
              }
              txnHash={row.transaction_hash}
            />
          </Tooltip>
        </span>
      ),
      header: <>{t('hash') || 'TXN HASH'}</>,
      key: 'transaction_hash',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: AccountNFTTxn) => (
        <span>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row?.cause}
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate">{row?.cause}</span>
            </span>
          </Tooltip>
        </span>
      ),
      header: <>{t('type') || 'METHOD'}</>,
      key: 'cause',
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: AccountNFTTxn) => (
        <>
          {row?.affected_account_id ? (
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row?.affected_account_id}
            >
              <span>
                <AddressOrTxnsLink
                  copy
                  className={'inline-block align-bottom whitespace-nowrap'}
                  currentAddress={row?.affected_account_id}
                />
              </span>
            </Tooltip>
          ) : (
            'system'
          )}
        </>
      ),
      header: <>Affected</>,
      key: 'affected_account_id',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10  font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: AccountNFTTxn) => (
        <>
          {row.involved_account_id === row.affected_account_id ? (
            <span className="uppercase rounded !min-w-[37px] px-1 h-6 flex items-center justify-center whitespace-nowrap bg-green-200 dark:bg-nearblue-650/[0.15] dark:text-neargray-650 dark:border dark:border-nearblue-650/[0.25] text-white text-xs font-semibold">
              {t('txnSelf') || 'SELF'}
            </span>
          ) : Number(row?.delta_amount) < 0 ? (
            <span className="uppercase rounded !min-w-[37px] px-1 h-6 flex items-center justify-center whitespace-nowrap bg-yellow-100 dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60 text-yellow-700 text-xs font-semibold">
              {t('txnOut') || 'OUT'}
            </span>
          ) : (
            <span className="uppercase rounded !min-w-[37px] px-1 h-6 flex items-center justify-center whitespace-nowrap bg-neargreen dark:bg-green-500/[0.15] dark:text-neargreen-300 dark:border dark:border-green-400/75 text-white text-xs font-semibold">
              {t('txnIn') || 'IN'}
            </span>
          )}
        </>
      ),
      header: '',
      key: '',
      tdClassName: 'text-center',
    },
    {
      cell: (row: AccountNFTTxn) => (
        <>
          {row.involved_account_id ? (
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row.involved_account_id}
            >
              <span>
                <AddressOrTxnsLink
                  copy
                  className={'inline-block align-bottom whitespace-nowrap'}
                  currentAddress={row?.involved_account_id}
                />
              </span>
            </Tooltip>
          ) : (
            'system'
          )}
        </>
      ),
      header: (
        <PopoverRoot>
          <PopoverTrigger
            asChild
            className="flex items-center px-2 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
          >
            <button>
              Involved
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="bg-white dark:bg-black-600 shadow-lg border dark:border-black-200 p-2 z-20"
            marginTop={-1.5}
            roundedBottom={'lg'}
            roundedTop={'none'}
            width={'48'}
          >
            <form className="flex flex-col" onSubmit={onFilter}>
              <input
                className="border dark:border-black-200 focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                name="involved"
                onChange={onChange}
                placeholder={
                  t('filter.placeholder') || 'Search by address e.g. Ⓝ..'
                }
                value={form.involved}
              />
              <div className="flex">
                <button
                  className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 h-7 text-white dark:text-black text-xs mr-2"
                  type="submit"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t('filter.filter') || 'Filter'}
                </button>
                <button
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-white text-xs h-7"
                  name="involved"
                  onClick={onClear}
                  type="button"
                >
                  {t('filter.clear') || 'Clear'}
                </button>
              </div>
            </form>
          </PopoverContent>
        </PopoverRoot>
      ),
      key: 'involved_account_id',
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600  font-medium dark:text-neargray-10',
      thClassName:
        'text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: AccountNFTTxn) => (
        <Tooltip
          className={'left-1/2 max-w-[200px]'}
          position="top"
          tooltip={row?.token_id}
        >
          <span>
            <Link
              className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
              href={`/nft-token/${row?.meta?.contract}/${encodeURIComponent(
                row?.token_id,
              )}`}
            >
              {truncateString(row?.token_id, 15, '...')}
            </Link>
          </span>
        </Tooltip>
      ),
      header: (
        <PopoverRoot>
          <PopoverTrigger
            asChild
            className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
          >
            <button>
              Token ID
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="bg-white dark:bg-black-600 shadow-lg border dark:border-black-200 p-2 z-20"
            marginTop={-1.5}
            roundedBottom={'lg'}
            roundedTop={'none'}
            width={'48'}
          >
            <form className="flex flex-col" onSubmit={onFilter}>
              <input
                className="border dark:border-black-200 focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                name="token"
                onChange={onChange}
                placeholder="Search by token ID"
                value={form.token}
              />
              <div className="flex">
                <button
                  className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 h-7 text-white dark:text-black text-xs mr-2"
                  type="submit"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t('filter.filter') || 'Filter'}
                </button>
                <button
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-neargray-10 text-xs h-7"
                  name="token"
                  onClick={onClear}
                  type="button"
                >
                  {t('filter.clear') || 'Clear'}
                </button>
              </div>
            </form>
          </PopoverContent>
        </PopoverRoot>
      ),
      key: 'token_id',
      tdClassName:
        'px-4 py-3 items-center my-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName: '',
    },
    {
      cell: (row: AccountNFTTxn) => {
        return (
          row?.meta && (
            <div className="flex flex-row items-center">
              <span className="inline-flex mr-1">
                <TokenImage
                  alt={row?.meta?.name}
                  className="w-4 h-4"
                  src={row?.meta?.icon}
                />
              </span>
              <Tooltip
                className={'left-1/2 max-w-[200px] whitespace-nowrap'}
                position="top"
                tooltip={row?.meta?.name}
              >
                <div className="text-sm text-nearblue-600 dark:text-neargray-10 max-w-[110px] inline-flex truncate whitespace-nowrap">
                  <Link
                    className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                    href={`/nft-token/${row?.meta?.contract}`}
                  >
                    {row?.meta?.name}
                  </Link>
                </div>
              </Tooltip>
              <CopyButton textToCopy={row?.meta?.contract} />
              {row?.meta?.symbol && (
                <Tooltip
                  className={'left-1/2 max-w-[200px]'}
                  position="top"
                  tooltip={row?.meta?.symbol}
                >
                  <div className="text-sm text-nearblue-700 max-w-[80px] inline-flex truncate whitespace-nowrap">
                    &nbsp; {row?.meta?.symbol}
                  </div>
                </Tooltip>
              )}
            </div>
          )
        );
      },
      header: (
        <PopoverRoot>
          <PopoverTrigger
            asChild
            className="flex items-center text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
          >
            <button>
              Token
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="bg-white dark:bg-black-600 shadow-lg border dark:border-black-200 p-2 z-20"
            marginTop={3}
            marginLeft={20}
            roundedBottom={'lg'}
            roundedTop={'none'}
            width={'48'}
          >
            <form className="flex flex-col" onSubmit={onFilter}>
              <input
                className="border dark:border-black-200 focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                name="contract"
                onChange={onChange}
                placeholder={t('tokenPlaceholder') || 'Search by token'}
                value={form.contract}
              />
              <div className="flex">
                <button
                  className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 h-7 text-white dark:text-black text-xs mr-2"
                  type="submit"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t('filter.filter') || 'Filter'}
                </button>
                <button
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-neargray-10 text-xs h-7"
                  name="contract"
                  onClick={onClear}
                  type="button"
                >
                  {t('filter.clear') || 'Clear'}
                </button>
              </div>
            </form>
          </PopoverContent>
        </PopoverRoot>
      ),
      key: 'token',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider',
    },
    {
      cell: (row: AccountNFTTxn) => (
        <span>
          <Timestamp
            showAge={showAge}
            timestamp={row?.block?.block_timestamp}
          />
        </span>
      ),
      header: (
        <div className="w-full inline-flex px-4 py-4">
          <Tooltip
            className={'left-1/2 max-w-[200px] top-6'}
            position="bottom"
            tooltip={
              <span className="flex flex-wrap">
                <span className="whitespace-nowrap">Click to show</span>{' '}
                <span className="whitespace-nowrap">
                  {showAge ? 'Datetime' : 'Age'} Format
                </span>
              </span>
            }
          >
            <button
              className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider  text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
              onClick={toggleShowAge}
              type="button"
            >
              {showAge ? t('age') || 'AGE' : t('ageDT') || 'DATE TIME (UTC)'}
              {showAge && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>
        </div>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: '',
    },
  ];

  const modifiedFilter = getFilteredQueryParams(currentParams, [
    FilterKind.TOKEN,
    FilterKind.INVOLVED,
    FilterKind.CONTRACT,
    FilterKind.AFTER_TS,
    FilterKind.BEFORE_TS,
  ]);

  return (
    <>
      <TableSummary
        filters={<Filters filters={modifiedFilter} onClear={onAllClear} />}
        linkToDowload={
          txns &&
          txns.length > 0 && (
            <button className="hover:no-underline ">
              <Link
                className="flex items-center text-nearblue-600 h-7 dark:text-neargray-10 gap-x-1 font-medium py-1 px-2.5 border border-neargray-700 dark:border-black-200 rounded-md bg-white dark:bg-black-600 hover:bg-neargray-800 whitespace-nowrap text-xs"
                href={`/nft-token/exportdata?address=${params?.id}`}
              >
                <span>
                  <Download />
                </span>
                <p className="-mb-0.5">CSV Export</p>
              </Link>
            </button>
          )
        }
        text={
          txns &&
          !error &&
          `A total of ${
            count ? localFormat && localFormat(count.toString()) : 0
          }${' '}
        transactions found`
        }
      />
      <Table
        columns={columns}
        cursor={cursor}
        cursorPagination={true}
        data={txns}
        Error={error}
        ErrorText={
          <ErrorMessage
            icons={<FaInbox />}
            message={errorMessage}
            mutedText="Please try again later"
          />
        }
        limit={25}
        page={page}
        setPage={setPage}
      />
    </>
  );
};

export default NFTTransactionActions;
