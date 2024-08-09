import ErrorMessage from '@/components/common/ErrorMessage';
import Paginator from '@/components/common/Paginator';
import { NFTImage } from '@/components/common/TokenImage';
import FaInbox from '@/components/Icons/FaInbox';
import Skeleton from '@/components/skeleton/common/Skeleton';
import { useFetch } from '@/hooks/useFetch';
import usePagination from '@/hooks/usePagination';
import { localFormat } from '@/utils/libs';
import { Token } from '@/utils/types';
import Link from 'next/link';

interface Props {
  id: string;
  token: Token;
}

export default function ({ id, token }: Props) {
  const { pqs, pagination, setPagination } = usePagination({ per_page: 24 });
  const { data, error, loading } = useFetch(`nfts/${id}/tokens?${pqs}`);
  const { data: countData, loading: countLoading } = useFetch(
    `nfts/${id}/tokens/count`,
  );

  const tokens = data?.tokens || [];
  const count = countData?.tokens?.[0]?.count || 0;

  const setPage = (page: any) => {
    if (typeof page === 'function') {
      return setPagination((state) => ({ ...state, page: page(state.page) }));
    }

    return setPagination('page', page);
  };

  return (
    <>
      <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
        {loading ? (
          <div className="pl-6 max-w-lg w-full py-5 ">
            <Skeleton className="h-4" />
          </div>
        ) : (
          <div
            className={`flex flex-col lg:flex-row pt-4 border-b dark:border-black-200`}
          >
            <div className="flex flex-col">
              <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
                {tokens.length > 0 &&
                  `A total of ${
                    localFormat && localFormat(count.toString())
                  }${' '}
              tokens found`}
              </p>
            </div>
          </div>
        )}
        {!loading && tokens.length === 0 && (
          <div className="px-6 py-4 text-gray-400 text-xs">
            <ErrorMessage
              icons={<FaInbox />}
              message="There are no matching entries"
              mutedText="Please try again later"
            />
          </div>
        )}
        <div className="flex flex-wrap sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 m-6">
          {loading &&
            [...Array(24)].map((_, i) => (
              <div
                className="max-w-full border rounded p-3 mx-auto md:mx-0"
                key={i}
              >
                <a
                  href="#"
                  className="flex items-center justify-center m-auto overflow-hidden"
                >
                  <div className="w-40 h-40 ">
                    <Skeleton className="h-40" />
                  </div>
                </a>
                <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10 mt-4">
                  <Skeleton className="h-4" />
                </div>
                <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10">
                  <Skeleton className="h-4" />
                </div>
              </div>
            ))}
          {!loading &&
            tokens &&
            tokens?.map((nft: Token) => (
              <div
                className="max-w-full border dark:border-black-200 rounded p-3 mx-auto md:mx-0"
                key={nft?.contract + nft?.token}
              >
                <Link
                  href={`/nft-token/${nft?.contract}/${nft?.token}`}
                  className="w-40 h-40 flex items-center justify-center m-auto overflow-hidden hover:no-underline"
                >
                  <NFTImage
                    base={token.base_uri}
                    media={nft.media}
                    reference={nft.reference}
                    className="rounded max-h-full"
                  />
                </Link>
                <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10 mt-4">
                  Token ID:{' '}
                  <Link
                    href={`/nft-token/${nft?.contract}/${nft?.token}`}
                    className="text-green dark:text-green-250 hover:no-underline"
                  >
                    {nft?.token}
                  </Link>
                </div>
                {nft?.asset && (
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10">
                    Owner:{' '}
                    <Link
                      href={`/address/${nft?.asset?.owner}`}
                      className="text-green dark:text-green-250 hover:no-underline"
                    >
                      {nft?.asset?.owner}
                    </Link>
                  </div>
                )}
              </div>
            ))}
        </div>
        {!error && (
          <Paginator
            count={count}
            page={pagination.page}
            isLoading={countLoading}
            setPage={setPage}
            limit={pagination.per_page}
            pageLimit={200}
          />
        )}
      </div>
    </>
  );
}