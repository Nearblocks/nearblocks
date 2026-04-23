import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { RPC } from 'nb-near';

import Copy from '@/components/Common/Copy';
import Tooltip from '@/components/Common/Tooltip';
import Skeleton from '@/components/Skeleton';
import convertor from '@/libs/convertor';
import formatter from '@/libs/formatter';
import { getAccountAccessKeys } from '@/libs/rpc';
import { shortenString } from '@/libs/utils';

const LIMIT = 25;

interface AccessKey {
  access: string;
  allowance: string;
  contract: string;
  methods: string;
  publicKey: string;
}

const AddressAccessKeys = ({ id, rpcUrl }: { id: string; rpcUrl: string }) => {
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(true);

  const [keys, setKeys] = useState<AccessKey[]>([]);

  const [page, setPage] = useState(1);
  const pages = Math.ceil(keys.length / LIMIT);
  const start = (page - 1) * LIMIT;
  const end = start + LIMIT;
  const items = keys?.slice(start, end);

  const { formatNumber } = formatter();
  const { yoctoToNear } = convertor();

  useEffect(() => {
    if (!rpcUrl || !id) return;
    const rpcEndpoint = new RPC(rpcUrl);

    setLoading(true);

    getAccountAccessKeys(rpcEndpoint, id)
      .then((response: any) => {
        if (!response) throw new Error('Failed to fetch keys');
        const rawKeys = response?.keys || response?.result?.keys;

        if (!rawKeys) return;

        const formattedKeys: AccessKey[] = rawKeys?.map((key: any) => {
          const publicKey = key?.public_key;
          let access = 'FULL';
          let contract = '';
          let methods = '';
          let allowance = '';

          if (key.access_key?.permission !== 'FullAccess') {
            const keyView = key?.access_key?.permission?.FunctionCall;
            access = 'LIMITED';
            contract = keyView?.receiver_id;
            methods = keyView?.method_names?.length
              ? keyView?.method_names?.join(', ')
              : 'Any';
            allowance = keyView?.allowance;
          }
          return {
            access,
            allowance,
            contract,
            methods,
            publicKey,
          };
        });

        if (formattedKeys.length) {
          setKeys(formattedKeys);
          setError(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch keys');
      })
      .finally(() => setLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, rpcUrl]);

  const onPrev = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };
  const onNext = () => {
    setPage((prevPage) => Math.min(prevPage + 1, pages));
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
            [...Array(LIMIT).keys()].map((k) => (
              <tr key={k}>
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
            items.map((key) => (
              <tr className="hover:bg-bg-body" key={key?.publicKey}>
                <td className="text-sm pl-6 pr-4 py-4">
                  <Tooltip
                    tooltip={
                      <span>
                        <span className="mr-1">{key?.publicKey}</span>
                        <Copy
                          buttonClassName="h-4 align-text-bottom"
                          className="w-4"
                          text={key?.publicKey}
                        />
                      </span>
                    }
                  >
                    {shortenString(key?.publicKey, 15)}
                  </Tooltip>
                </td>
                <td className="text-xs px-4 py-4">
                  <span className="bg-bg-function text-black px-2 py-1 rounded">
                    {key.access}
                  </span>
                </td>
                <td className="font-medium text-sm px-4 py-4">
                  {key.contract && (
                    <Tooltip tooltip={key?.contract}>
                      <Link href={`/address/${key?.contract}`}>
                        {shortenString(key?.contract)}
                      </Link>
                    </Tooltip>
                  )}
                </td>
                <td className="text-sm px-4 py-4">
                  <Tooltip tooltip={key?.methods}>
                    <span className="block w-[200px] truncate">
                      {key?.methods}
                    </span>
                  </Tooltip>
                </td>
                <td className="text-sm pl-4 pr-6 py-4">
                  {key?.allowance
                    ? `${formatNumber(yoctoToNear(key?.allowance), 4)} Ⓝ`
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

export default AddressAccessKeys;
