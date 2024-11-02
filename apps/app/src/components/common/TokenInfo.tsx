import {
  localFormat,
  shortenToken,
  shortenTokenSymbol,
  tokenAmount,
} from '@/utils/libs';
import { MetaInfo, TokenInfoProps } from '@/utils/types';
import { useEffect, useState } from 'react';
import TokenImage from './TokenImage';
import { Link } from '@/i18n/routing';
import useRpc from '@/hooks/app/useRpc';

const TokenInfo = (props: TokenInfoProps) => {
  const { contract, amount, decimals } = props;
  const [meta, setMeta] = useState<MetaInfo>({} as MetaInfo);
  const { ftMetadata } = useRpc();

  useEffect(() => {
    ftMetadata(contract).then(setMeta).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);
  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props?.className} ${props?.wrapperClassName}`}
      ></div>
    );
  };

  return !meta?.name ? (
    <Loader wrapperClassName="flex w-full max-w-xs" />
  ) : (
    <>
      <span className="font-normal px-1">
        {amount
          ? localFormat(tokenAmount(amount, decimals || meta?.decimals, true))
          : amount ?? ''}
      </span>
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
          <span>&nbsp;({shortenTokenSymbol(meta?.symbol)})</span>
        </span>
      </Link>
    </>
  );
};
export default TokenInfo;
