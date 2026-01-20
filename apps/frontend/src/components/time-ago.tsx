'use client';

import OGTimeAgo from 'react-timeago';
import { makeIntlFormatter } from 'react-timeago/defaultFormatter';

import { useLocale } from '@/hooks/use-locale';

type Props = {
  ns: null | string | undefined;
};

export const TimeAgo = ({ ns }: Props) => {
  const { locale } = useLocale();

  const intlFormatter = makeIntlFormatter({
    locale,
    numeric: 'auto',
    style: 'long',
  });

  if (!ns) return null;

  return (
    <OGTimeAgo
      date={new Date(+ns / 10 ** 6)}
      formatter={intlFormatter}
      live={false}
    />
  );
};
