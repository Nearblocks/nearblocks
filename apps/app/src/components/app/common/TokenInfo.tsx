import { useEffect, useState } from 'react';

import useRpc from '@/hooks/app/useRpc';
import { Link } from '@/i18n/routing';
import {
  localFormat,
  shortenToken,
  shortenTokenSymbol,
} from '@/utils/app/libs';
import { tokenAmount } from '@/utils/app/near';
import { MetaInfo, TokenInfoProps } from '@/utils/types';

import Skeleton from '../skeleton/common/Skeleton';
import TokenImage from './TokenImage';

const TokenInfo = (props: TokenInfoProps) => {
  const { amount, contract, decimals } = props;
  const [meta, setMeta] = useState<MetaInfo>({} as MetaInfo);
  const [loading, setLoading] = useState(true);
  const { ftMetadata } = useRpc();

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

  return loading ? (
    <Skeleton className="h-4 w-40" />
  ) : (
    <>
      <span className="font-normal px-1">
        {amount
          ? localFormat(tokenAmount(amount, decimals || meta?.decimals, true))
          : amount ?? ''}
      </span>
      <Link
        className="text-green flex items-center hover:no-underline dark:text-green-250 font-semibold"
        href={`/token/${contract}`}
      >
        <span className="flex items-center">
          <TokenImage
            alt={meta?.name}
            className="w-4 h-4 mx-1"
            src={meta?.icon}
          />
          {shortenToken(meta?.name)}
          <span>&nbsp;({shortenTokenSymbol(meta?.symbol)})</span>
        </span>
      </Link>
    </>
  );
};
export default TokenInfo;
