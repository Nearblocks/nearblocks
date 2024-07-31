import type { RpcResultAccessKey } from 'nb-near';

import type { CopyProps } from '@/Atoms/Copy';
import type { TooltipProps } from '@/Atoms/Tooltip';
import type { ConvertorModule } from '@/libs/convertor';
import type { FetcherModule } from '@/libs/fetcher';
import type { FormatterModule } from '@/libs/formatter';
import type { UtilsModule } from '@/libs/utils';
import type { Keys } from '@/types/types';

export type KeysProps = {
  id: string;
  rpcUrl: string;
};

let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);
let AddressKeysSkeleton = window?.AddressKeysSkeleton || (() => <></>);

const LIMIT = 25;

const Keys = ({ id, rpcUrl }: KeysProps) => {
  let { rpcFetch } = VM.require<FetcherModule>(
    `${config_account}/widget/lite.libs.fetcher`,
  );
  let { yoctoToNear } = VM.require<ConvertorModule>(
    `${config_account}/widget/lite.libs.convertor`,
  );
  let { formatNumber } = VM.require<FormatterModule>(
    `${config_account}/widget/lite.libs.formatter`,
  );
  let { shortenString } = VM.require<UtilsModule>(
    `${config_account}/widget/lite.libs.utils`,
  );

  if (!rpcFetch || !yoctoToNear || !formatNumber || !shortenString)
    return <AddressKeysSkeleton />;

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<Keys[]>([]);

  const [page, setPage] = useState(1);

  const pages = Math.ceil(keys.length / LIMIT);
  const start = (page - 1) * LIMIT;
  const end = start + LIMIT;
  const items = keys?.slice(start, end);

  useEffect(() => {
    if (rpcFetch && rpcUrl && id) {
      setLoading(true);
      rpcFetch<RpcResultAccessKey>(rpcUrl, 'query', {
        account_id: id,
        finality: 'final',
        request_type: 'view_access_key_list',
      })
        .then((response) => {
          const keys = response.keys.map((key) => {
            const publicKey = key.public_key;
            let access = 'FULL';
            let contract = '';
            let methods = '';
            let allowance = '';

            if (key.access_key.permission !== 'FullAccess') {
              const keyView = key.access_key.permission.FunctionCall;
              access = 'LIMITED';
              contract = keyView.receiver_id;
              methods = keyView.method_names?.length
                ? keyView.method_names.join(', ')
                : 'Any';
              allowance = keyView.allowance;
            }

            return {
              access,
              allowance,
              contract,
              methods,
              publicKey,
            };
          });

          if (keys.length) {
            setKeys(keys);
          }
        })
        .catch(setError)
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onPrev = () => {
    setPage((prevPage: number) => Math.max(prevPage - 1, 1));
  };

  const onNext = () => {
    setPage((prevPage: number) => Math.min(prevPage + 1, pages));
  };

  return (
    <div className="relative overflow-auto">
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr>
            <th className="w-[300px] font-normal text-xs text-text-label uppercase text-left pl-6 pr-4 py-4">
              Public Key
            </th>
            <th className="w-[84px] font-normal text-xs text-text-label uppercase text-left px-4 py-4">
              Access
            </th>
            <th className="w-[160px] font-normal text-xs text-text-label uppercase text-left px-4 py-4">
              Contract
            </th>
            <th className="w-[240px] font-normal text-xs text-text-label uppercase text-left px-4 py-4">
              Methods
            </th>
            <th className="w-[112px] font-normal text-xs text-text-label uppercase text-left pl-4 pr-6 py-4">
              Allowance
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-6" colSpan={5}>
              <span className="block w-full border-b border-b-border-body" />
            </td>
          </tr>
          {loading ? (
            [...Array(LIMIT).keys()].map((key) => (
              <tr key={key}>
                <td className="h-[46px] pl-6 pr-4 py-4">
                  <span className="flex">
                    <Skeleton className="h-5 w-[190px]" loading>
                      &nbsp;
                    </Skeleton>
                  </span>
                </td>
                <td className="h-[46px] px-4 py-4">
                  <span className="flex">
                    <Skeleton className="h-5 w-[64px]" loading>
                      &nbsp;
                    </Skeleton>
                  </span>
                </td>
                <td className="h-[46px] px-4 py-4">
                  <span className="flex">
                    <Skeleton className="h-5 w-[100px]" loading>
                      &nbsp;
                    </Skeleton>
                  </span>
                </td>
                <td className="h-[46px] px-4 py-4">
                  <span className="flex">
                    <Skeleton className="h-5 w-[160px]" loading>
                      &nbsp;
                    </Skeleton>
                  </span>
                </td>
                <td className="h-[46px] pl-4 pr-6 py-4">
                  <span className="flex">
                    <Skeleton className="h-5 w-[64px]" loading>
                      &nbsp;
                    </Skeleton>
                  </span>
                </td>
              </tr>
            ))
          ) : items?.length ? (
            items?.map((key) => (
              <tr className="hover:bg-bg-body" key={key.publicKey}>
                <td className="text-sm pl-6 pr-4 py-4">
                  <Widget<TooltipProps>
                    key="tooltip"
                    loading={shortenString(key.publicKey, 15)}
                    props={{
                      children: shortenString(key.publicKey, 15),
                      tooltip: (
                        <span>
                          <span className="mr-1">{key.publicKey}</span>
                          <Widget<CopyProps>
                            key="copy"
                            loading={
                              <span className="block w-4 h-4 truncate" />
                            }
                            props={{
                              buttonClassName: 'h-4 align-text-bottom',
                              className: 'w-4',
                              text: key.publicKey,
                            }}
                            src={`${config_account}/widget/lite.Atoms.Copy`}
                          />
                        </span>
                      ),
                    }}
                    src={`${config_account}/widget/lite.Atoms.Tooltip`}
                  />
                </td>
                <td className="text-xs px-4 py-4">
                  <span className="bg-bg-function text-black px-2 py-1 rounded">
                    {key.access}
                  </span>
                </td>
                <td className="font-medium text-sm px-4 py-4">
                  {key.contract && (
                    <Widget<TooltipProps>
                      key="tooltip"
                      loading={shortenString(key.contract)}
                      props={{
                        children: (
                          <Link href={`/address/${key.contract}`}>
                            {shortenString(key.contract)}
                          </Link>
                        ),
                        tooltip: key.contract,
                      }}
                      src={`${config_account}/widget/lite.Atoms.Tooltip`}
                    />
                  )}
                </td>
                <td className="text-sm px-4 py-4">
                  <Widget<TooltipProps>
                    key="tooltip"
                    loading={
                      <span className="block w-[200px] truncate">
                        {key.methods}
                      </span>
                    }
                    props={{
                      children: (
                        <span className="block w-[200px] truncate">
                          {key.methods}
                        </span>
                      ),
                      tooltip: key.methods,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Tooltip`}
                  />
                </td>
                <td className="text-sm pl-4 pr-6 py-4">
                  {key.allowance
                    ? `${formatNumber(yoctoToNear(key.allowance), 4)} Ⓝ`
                    : ''}
                </td>
              </tr>
            ))
          ) : error ? (
            <tr>
              <td
                className="font-medium text-sm text-text-label px-6 py-4"
                colSpan={5}
              >
                Error fetching access keys
              </td>
            </tr>
          ) : (
            <tr>
              <td
                className="font-medium text-sm text-text-label px-6 py-4"
                colSpan={5}
              >
                No access keys
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="px-6">
        <div className="flex items-center justify-between border-t border-t-border-body">
          <button
            className="font-normal text-xs text-text-label uppercase px-2 py-1 rounded mr-4 my-4 border border-border-body hover:text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:text-text-label disabled:border-border-body"
            disabled={page <= 1}
            onClick={onPrev}
          >
            Prev
          </button>
          <div className="font-normal text-xs text-text-label uppercase px-2 py-1 mx-4 my-4">
            Page {page}
          </div>
          <button
            className="font-normal text-xs text-text-label uppercase px-2 py-1 rounded ml-4 my-4 border border-border-body hover:text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:text-text-label disabled:border-border-body"
            disabled={page >= pages}
            onClick={onNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Keys;
