import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { RpcResultAccessKey } from 'nb-near';

import Tooltip from '@/components/Atoms/Tooltip';
import CopyButton from '@/components/CopyButton';
import Skeleton from '@/components/Skeleton';
import { yoctoToNear } from '@/libs/convertor';
import { rpcFetch } from '@/libs/fetcher';
import { formatNumber } from '@/libs/formatter';
import { shortenString } from '@/libs/txn';

type KeysProps = {
  id?: string;
  rpcUrl: string;
};

type AccessKey = {
  access: string;
  allowance: string;
  contract: string;
  methods: string;
  publicKey: string;
};

const LIMIT = 25;

const Keys = ({ id, rpcUrl }: KeysProps) => {
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [page, setPage] = useState(1);

  const pages = Math.ceil(keys.length / LIMIT);
  const start = (page - 1) * LIMIT;
  const items = keys.slice(start, start + LIMIT);

  useEffect(() => {
    if (!rpcUrl || !id) return;

    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    setPage(1);
    rpcFetch<RpcResultAccessKey>(
      rpcUrl,
      'query',
      {
        account_id: id,
        finality: 'final',
        request_type: 'view_access_key_list',
      },
      { signal },
    )
      .then((response) => {
        setKeys(
          response.keys.map((key) => {
            if (key.access_key.permission === 'FullAccess') {
              return {
                access: 'FULL',
                allowance: '',
                contract: '',
                methods: '',
                publicKey: key.public_key,
              };
            }

            const keyView = key.access_key.permission.FunctionCall;

            return {
              access: 'LIMITED',
              allowance: keyView.allowance,
              contract: keyView.receiver_id,
              methods: keyView.method_names?.length
                ? keyView.method_names.join(', ')
                : 'Any',
              publicKey: key.public_key,
            };
          }),
        );
        setError(null);
      })
      .catch((err) => {
        if (signal.aborted) return;

        setKeys([]);
        setError(err);
      })
      .finally(() => !signal.aborted && setLoading(false));

    return () => controller.abort();
  }, [id, rpcUrl]);

  const onPrev = () => setPage((prevPage) => Math.max(prevPage - 1, 1));
  const onNext = () => setPage((prevPage) => Math.min(prevPage + 1, pages));

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
          ) : items.length ? (
            items.map((key) => (
              <tr className="hover:bg-bg-body" key={key.publicKey}>
                <td className="text-sm pl-6 pr-4 py-4">
                  <Tooltip
                    tooltip={
                      <span>
                        <span className="mr-1">{key.publicKey}</span>
                        <CopyButton
                          buttonClassName="h-4 align-text-bottom"
                          className="w-4"
                          text={key.publicKey}
                        />
                      </span>
                    }
                  >
                    {shortenString(key.publicKey, 15)}
                  </Tooltip>
                </td>
                <td className="text-xs px-4 py-4">
                  <span className="bg-bg-function text-black px-2 py-1 rounded">
                    {key.access}
                  </span>
                </td>
                <td className="font-medium text-sm px-4 py-4">
                  {key.contract && (
                    <Tooltip tooltip={key.contract}>
                      <Link href={`/address/${key.contract}`}>
                        {shortenString(key.contract)}
                      </Link>
                    </Tooltip>
                  )}
                </td>
                <td className="text-sm px-4 py-4">
                  <Tooltip tooltip={key.methods}>
                    <span className="block w-[200px] truncate">
                      {key.methods}
                    </span>
                  </Tooltip>
                </td>
                <td className="text-sm pl-4 pr-6 py-4">
                  {key.allowance
                    ? `${formatNumber(yoctoToNear(key.allowance), 4)} Ⓝ`
                    : ''}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="font-medium text-sm text-text-label px-6 py-4"
                colSpan={5}
              >
                {error ? 'Error fetching access keys' : 'No access keys'}
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
