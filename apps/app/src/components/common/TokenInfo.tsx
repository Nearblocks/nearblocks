import {
  localFormat,
  shortenToken,
  shortenTokenSymbol,
  tokenAmount,
} from '@/utils/libs';
import { MetaInfo, TokenInfoProps } from '@/utils/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useRpc from '@/hooks/useRpc';
import TokenImage from './TokenImage';
import { useRpcStore } from '@/stores/rpc';
import { isEmpty } from 'lodash';

const TokenInfo = (props: TokenInfoProps) => {
  const { contract, amount, decimals, isShowText } = props;

  const [meta, setMeta] = useState<MetaInfo>({} as MetaInfo);
  const { ftMetadata } = useRpc();
  const [loading, setLoading] = useState(true);
  const switchRpc: () => void = useRpcStore((state) => state.switchRpc);

  const rpcAmount = localFormat(
    tokenAmount(amount, decimals || meta?.decimals, true),
  );

  useEffect(() => {
    setLoading(true);
    ftMetadata(contract)
      .then((data) => {
        setMeta(data);
        setLoading(false);
        if (isEmpty(data)) {
          setLoading(true);
          switchRpc();
        }
      })
      .catch((error) => {
        console.error(error);
        setLoading(true);
        switchRpc();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  const Loader = ({
    className = '',
    wrapperClassName = '',
  }: {
    className?: string;
    wrapperClassName?: string;
  }) => (
    <div
      className={`bg-gray-200 dark:bg-black-200 h-4 w-full max-w-xs rounded shadow-sm animate-pulse ${className} ${wrapperClassName}`}
    ></div>
  );

  return loading ? (
    <Loader wrapperClassName="flex !w-32 max-w-xs" />
  ) : (
    <>
      <span className="font-normal pl-1">{rpcAmount}</span>
      <Link
        href={`/token/${contract}`}
        className="text-green flex items-center hover:no-underline dark:text-green-250"
      >
        <span className="flex items-center">
          <TokenImage
            src={meta?.icon}
            alt={meta?.name}
            className="w-4 h-4 mx-1"
          />
          {shortenToken(meta?.name)}
          <span>
            &nbsp;(
            {isShowText
              ? `i${shortenTokenSymbol(meta?.symbol)}`
              : shortenTokenSymbol(meta?.symbol)}
            )
          </span>
        </span>
      </Link>
    </>
  );
};
export default TokenInfo;
