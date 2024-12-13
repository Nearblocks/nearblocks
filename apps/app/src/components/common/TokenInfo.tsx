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
import Big from 'big.js';

const TokenInfo = (props: TokenInfoProps) => {
  const { contract, amount, decimals, apiTokenInfo } = props;

  const [meta, setMeta] = useState<MetaInfo>({} as MetaInfo);
  const { ftMetadata } = useRpc();
  const [loading, setLoading] = useState(true);

  const apiMeta = {
    icon: apiTokenInfo?.ft_meta?.icon,
    name: apiTokenInfo?.ft_meta?.name,
    symbol: apiTokenInfo?.ft_meta?.symbol,
    decimals: apiTokenInfo?.ft_meta?.decimals,
    delta_amount: apiTokenInfo?.delta_amount,
  };

  function absoluteValue(number: string) {
    return new Big(number).abs().toString();
  }
  const rpcAmount = localFormat(
    tokenAmount(amount, decimals || meta?.decimals, true),
  );

  const apiAmount =
    apiMeta?.delta_amount && apiMeta?.decimals && tokenAmount
      ? tokenAmount(
          absoluteValue(apiMeta?.delta_amount),
          apiMeta?.decimals,
          true,
        )
      : '';

  useEffect(() => {
    setLoading(true);
    ftMetadata(contract)
      .then((data) => {
        setMeta(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
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
      className={`bg-gray-200 dark:bg-black-200 h-5 w-full max-w-xs rounded shadow-sm animate-pulse ${className} ${wrapperClassName}`}
    ></div>
  );

  return loading ? (
    <Loader wrapperClassName="flex w-full max-w-xs" />
  ) : (
    <>
      <span className="font-normal px-1">
        {Number(rpcAmount) === 0 ? apiAmount : rpcAmount}
      </span>
      <Link
        href={`/token/${contract}`}
        className="text-green flex items-center hover:no-underline dark:text-green-250"
      >
        <span className="flex items-center">
          <TokenImage
            src={meta?.icon || apiMeta?.icon}
            alt={meta?.name || apiMeta?.name}
            className="w-4 h-4 mx-1"
          />
          {shortenToken(meta?.name || apiMeta?.name)}
          <span>
            &nbsp;({shortenTokenSymbol(meta?.symbol || apiMeta?.symbol)})
          </span>
        </span>
      </Link>
    </>
  );
};
export default TokenInfo;
