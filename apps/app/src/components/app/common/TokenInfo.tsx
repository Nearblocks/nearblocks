import {
  localFormat,
  shortenToken,
  shortenTokenSymbol,
  tokenAmount,
} from '@/utils/libs';
import { MetaInfo, TokenInfoProps } from '@/utils/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import TokenImage from '@/components/app/common/TokenImage';
import useRpc from '@/hooks/app/useRpc';
import { useRpcStore } from '@/stores/app/rpc';
import { isEmpty } from 'lodash';

const TokenInfo = (props: TokenInfoProps) => {
  const { contract, amount, decimals, isShowText, metaInfo } = props;
  const apiMeta = metaInfo && metaInfo[0]?.metadata;
  const [meta, setMeta] = useState<MetaInfo>({} as MetaInfo);
  const { ftMetadata } = useRpc();
  const [loading, setLoading] = useState(false);
  const switchRpc: () => void = useRpcStore((state) => state.switchRpc);

  const rpcAmount = localFormat(
    tokenAmount(amount, decimals || apiMeta?.decimals || meta?.decimals, true),
  );
  useEffect(() => {
    if (!apiMeta) {
      setLoading(true);
      ftMetadata(contract)
        .then((data) => {
          if (isEmpty(data)) {
            switchRpc();
          }
          setMeta(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          switchRpc();
          setLoading(false);
        });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, metaInfo]);

  const Loader = ({
    className = '',
    wrapperClassName = '',
  }: {
    className?: string;
    wrapperClassName?: string;
  }) => (
    <div
      className={`bg-gray-200 dark:bg-black-200 h-5 w-full max-w-xs rounded shadow-sm animate-pulse ${className} ${wrapperClassName}`}
    ></div>
  );

  if (loading || (!apiMeta && isEmpty(meta))) {
    return <Loader wrapperClassName="flex !w-52 max-w-xs" />;
  }

  return (
    <>
      <span className="font-normal pl-1">{rpcAmount}</span>
      <Link
        href={`/token/${contract}`}
        className="text-green flex items-center hover:no-underline dark:text-green-250 font-semibold"
      >
        <span className="flex items-center">
          <TokenImage
            src={apiMeta ? apiMeta?.icon : meta?.icon}
            alt={apiMeta ? apiMeta?.name : meta?.name}
            className="w-4 h-4 mx-1"
          />
          {shortenToken(apiMeta ? apiMeta?.name : meta?.name)}
          <span>
            &nbsp;(
            {isShowText
              ? `i${shortenTokenSymbol(
                  apiMeta ? apiMeta?.symbol : meta?.symbol,
                )}`
              : shortenTokenSymbol(apiMeta ? apiMeta?.symbol : meta?.symbol)}
            )
          </span>
        </span>
      </Link>
    </>
  );
};
export default TokenInfo;
