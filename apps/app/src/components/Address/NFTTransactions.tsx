import { Menu, MenuButton, MenuList } from '@reach/menu-button';
import { Tooltip } from '@reach/tooltip';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Link, useIntlRouter, usePathname } from '@/i18n/routing';
import { localFormat, truncateString } from '@/utils/libs';
import { TransactionInfo } from '@/utils/types';

import ErrorMessage from '../common/ErrorMessage';
import Filters from '../common/Filters';
import TxnStatus from '../common/Status';
import Table from '../common/Table';
import TableSummary from '../common/TableSummary';
import TokenImage from '../common/TokenImage';
import Clock from '../Icons/Clock';
import Download from '../Icons/Download';
import FaInbox from '../Icons/FaInbox';
import Filter from '../Icons/Filter';
import SortIcon from '../Icons/SortIcon';
import Skeleton from '../skeleton/common/Skeleton';

const initialForm = {
  event: '',
  involved: '',
};

interface NftTokenTxnsProps {
  count: string;
  cursor: string;
  error: boolean;
  tab: string;
  txns: TransactionInfo[];
}

const TimeStamp = dynamic(() => import('../common/TimeStamp'), { ssr: false });

const NFTTransactions = ({
  count,
  cursor,
  error,
  tab,
  txns,
}: NftTokenTxnsProps) => {
  const t = useTranslations();
  const router = useRouter();
  const intlRouter = useIntlRouter();
  const pathname = usePathname();
  const { id } = router.query;
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [showAge, setShowAge] = useState(true);
  const [address, setAddress] = useState('');
  const errorMessage = t ? t('noTxns') : ' No transactions found!';
  const toggleShowAge = () => setShowAge((s) => !s);

  const onChange = (e: any) => {
    const name = e?.target?.name;
    const value = e?.target?.value;

    setForm((f) => ({ ...f, [name]: value }));
  };

  const onOrder = () => {
    const currentOrder = router.query.order || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    const { id, locale, ...rest } = router.query;

    // @ts-ignore: Unreachable code error
    intlRouter.push({
      pathname: pathname,
      query: {
        ...rest,
        order: newOrder,
      },
    });
  };

  const onFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPage(1);

    const { event, involved } = form;
    const { query } = router;
    const { cursor, id, locale, p, ...updatedQuery } = query;

    const queryParams = {
      ...(event && { event: event.toUpperCase() }),
      ...(involved && { involved }),
    };

    const finalQuery = { ...updatedQuery, ...queryParams };

    // @ts-ignore: Unreachable code error
    intlRouter.push({ pathname, query: finalQuery });
  };

  const onClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = e.currentTarget;
    const { cursor, id, locale, p, ...restQuery } = router.query;

    setPage(1);
    setForm((f) => ({ ...f, [name]: '' }));
    const { [name]: _, ...newQuery } = restQuery;

    // @ts-ignore: Unreachable code error
    intlRouter.push({
      pathname: pathname,
      query: newQuery,
    });
  };

  const onAllClear = () => {
    setForm(initialForm);

    const { cursor, event, id, involved, locale, p, ...newQuery } =
      router.query;

    // @ts-ignore: Unreachable code error
    intlRouter.push({
      pathname: pathname,
      query: newQuery,
    });
  };

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();

    setAddress(id);
  };
  const handleMouseLeave = () => {
    setAddress('');
  };

  const columns = [
    {
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus showLabel={false} status={row?.outcomes?.status} />
        </>
      ),
      header: '',
      key: '',
      tdClassName:
        'pl-5 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            label={row?.transaction_hash}
          >
            <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap">
              <Link
                className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                href={`/txns/${row?.transaction_hash}`}
              >
                {row?.transaction_hash}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      header: <>{t ? t('hash') : 'TXN HASH'}</>,
      key: 'transaction_hash',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            label={row?.cause}
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate">{row?.cause}</span>
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <Menu>
          <MenuButton className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider focus:outline-none">
            {t ? t('type') : 'METHOD'}{' '}
            <Filter className="h-4 w-4 fill-current ml-2" />
          </MenuButton>
          <MenuList className="bg-white shadow-lg border rounded-b-lg p-2">
            <form className="flex flex-col" onSubmit={onFilter}>
              <input
                className="border rounded h-8 mb-2 px-2 text-gray-500 text-xs"
                name="event"
                onChange={onChange}
                placeholder="Search by method"
                value={form.event}
              />
              <div className="flex">
                <button
                  className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                  type="submit"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t ? t('filter.filter') : 'Filter'}
                </button>
                <button
                  className="flex-1 rounded bg-gray-300 text-xs h-7"
                  name="event"
                  onClick={onClear}
                  type="button"
                >
                  {t ? t('filter.clear') : 'Clear'}
                </button>
              </div>
            </form>
          </MenuList>
        </Menu>
      ),
      key: 'cause',
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: TransactionInfo) => (
        <>
          {row?.affected_account_id ? (
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
              label={row?.affected_account_id}
            >
              <span
                className={`inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
                  row?.affected_account_id === address
                    ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                    : 'text-green-500 dark:text-green-250 border-transparent'
                }`}
              >
                <Link
                  className="text-green-500 dark:text-green-250 hover:no-underline"
                  href={`/address/${row?.affected_account_id}`}
                  onMouseLeave={handleMouseLeave}
                  onMouseOver={(e) =>
                    onHandleMouseOver(e, row?.affected_account_id)
                  }
                >
                  {truncateString(row?.affected_account_id, 15, '...')}
                </Link>
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
      cell: (row: TransactionInfo) => (
        <>
          {row?.involved_account_id === row?.affected_account_id ? (
            <span className="uppercase rounded w-10 py-2 h-6 flex items-center justify-center bg-green-200 dark:bg-nearblue-650/[0.15] dark:text-neargray-650 dark:border dark:border-nearblue-650/[0.25] text-white text-xs font-semibold">
              {t ? t('txnSelf') : 'SELF'}
            </span>
          ) : Number(row?.delta_amount) < 0 ? (
            <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60 text-yellow-700 text-xs font-semibold">
              {t ? t('txnOut') : 'OUT'}
            </span>
          ) : (
            <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-neargreen dark:bg-green-500/[0.15] dark:text-neargreen-300 dark:border dark:border-green-400/75 text-white text-xs font-semibold">
              {t ? t('txnIn') : 'IN'}
            </span>
          )}
        </>
      ),
      header: '',
      key: '',
      tdClassName: 'text-center',
    },
    {
      cell: (row: TransactionInfo) => (
        <>
          {row?.involved_account_id ? (
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
              label={row?.involved_account_id}
            >
              <span>
                <Link
                  className={`text-green-500 dark:text-green-250 hover:no-underline p-0.5 px-1 border rounded-md whitespace-nowrap ${
                    row?.involved_account_id === address
                      ? ' bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                      : 'text-green-500 dark:text-green-250 hover:no-underline border-transparent'
                  }`}
                  href={`/address/${row?.involved_account_id}`}
                  onMouseLeave={handleMouseLeave}
                  onMouseOver={(e) =>
                    onHandleMouseOver(e, row?.involved_account_id)
                  }
                >
                  {truncateString(row?.involved_account_id, 15, '...')}
                </Link>
              </span>
            </Tooltip>
          ) : (
            'system'
          )}
        </>
      ),
      header: (
        <Menu>
          <MenuButton className="flex items-center px-2 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
            Involved
            <Filter className="h-4 w-4 fill-current ml-2" />
          </MenuButton>
          <MenuList className="z-50 bg-white dark:bg-black-600 shadow-lg border dark:border-black-200 rounded-b-lg p-2">
            <form className="flex flex-col" onSubmit={onFilter}>
              <input
                className="border dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                name="involved"
                onChange={onChange}
                placeholder={
                  t ? t('filter.placeholder') : 'Search by address e.g. Ⓝ..'
                }
                value={form.involved}
              />
              <div className="flex">
                <button
                  className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                  type="submit"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t ? t('filter.filter') : 'Filter'}
                </button>
                <button
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-white text-xs h-7"
                  name="involved"
                  onClick={onClear}
                  type="button"
                >
                  {t ? t('filter.clear') : 'Clear'}
                </button>
              </div>
            </form>
          </MenuList>
        </Menu>
      ),
      key: 'involved_account_id',
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600  font-medium dark:text-neargray-10',
      thClassName:
        'text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => (
        <Tooltip
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          label={row?.token_id}
        >
          <span>
            <Link
              className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
              href={`/nft-token/${row?.nft?.contract}/${row?.token_id}`}
            >
              {truncateString(row?.token_id, 15, '...')}
            </Link>
          </span>
        </Tooltip>
      ),
      header: <>Token ID</>,
      key: 'token_id',
      tdClassName:
        'px-4 py-3 items-center my-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => {
        return (
          row?.nft && (
            <div className="flex flex-row items-center">
              <span className="inline-flex mr-1">
                <TokenImage
                  alt={row?.nft?.name}
                  className="w-4 h-4"
                  src={row?.nft?.icon}
                />
              </span>
              <Tooltip
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                label={row?.nft?.name}
              >
                <div className="text-sm text-nearblue-600 dark:text-neargray-10 max-w-[110px] inline-block truncate whitespace-nowrap">
                  <Link
                    className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                    href={`/nft-token/${row?.nft?.contract}`}
                  >
                    {row?.nft?.name}
                  </Link>
                </div>
              </Tooltip>

              {row?.nft?.symbol && (
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                  label={row?.nft?.symbol}
                >
                  <div className="text-sm text-nearblue-700 max-w-[80px] inline-block truncate whitespace-nowrap">
                    &nbsp; {row?.nft?.symbol}
                  </div>
                </Tooltip>
              )}
            </div>
          )
        );
      },
      header: <>Token</>,
      key: 'block_height',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <TimeStamp showAge={showAge} timestamp={row?.block_timestamp} />
        </span>
      ),
      header: (
        <div className="w-full inline-flex px-4 py-4">
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            label={
              showAge
                ? 'Click to show Datetime Format'
                : 'Click to show Age Format'
            }
          >
            <button
              className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider  text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
              onClick={toggleShowAge}
              type="button"
            >
              {showAge
                ? t
                  ? t('age')
                  : 'AGE'
                : t
                ? t('ageDT')
                : 'DATE TIME (UTC)'}
              {showAge && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>

          <button className="px-2" onClick={onOrder} type="button">
            <div className="text-nearblue-600 font-semibold">
              <SortIcon order={router?.query?.order as string} />
            </div>
          </button>
        </div>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: 'whitespace-nowrap',
    },
  ];

  function removeCursor() {
    const queryParams = router.query;
    const {
      cursor,
      filter,
      id,
      keyword,
      locale,
      order,
      p,
      query,
      tab,
      ...rest
    } = queryParams;
    return rest;
  }

  const modifiedFilter = removeCursor();

  return (
    <>
      {tab === 'nfttokentxns' ? (
        <>
          {!count ? (
            <div className="pl-6 max-w-lg w-full py-5 ">
              <Skeleton className="h-4" />
            </div>
          ) : (
            <TableSummary
              filters={
                <Filters filters={modifiedFilter} onClear={onAllClear} />
              }
              linkToDowload={
                txns &&
                txns?.length > 0 && (
                  <button className="hover:no-underline ">
                    <Link
                      className="flex items-center text-nearblue-600 dark:text-neargray-10 font-medium py-2 border dark:border-black-200 border-neargray-700 px-4 rounded-md bg-white dark:bg-black-600  hover:bg-neargray-800"
                      href={`/nft-token/exportdata?address=${id}`}
                    >
                      <p>CSV Export</p>
                      <span className="ml-2">
                        <Download />
                      </span>
                    </Link>
                  </button>
                )
              }
              text={
                txns &&
                !error &&
                `A total of ${
                  count ? localFormat && localFormat(count?.toString()) : 0
                }${' '}
        transactions found`
              }
            />
          )}
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
      ) : (
        <div className="w-full h-[500px]"></div>
      )}
    </>
  );
};

export default NFTTransactions;
