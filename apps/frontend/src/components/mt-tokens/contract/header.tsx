'use client';

import { AccountLink } from '@/components/link';
import { Truncate } from '@/components/truncate';

type Props = {
  cid: string;
  loading?: boolean;
};

export const MtTokenHeader = ({ cid, loading: _ }: Props) => (
  <Truncate className="flex items-center gap-2">
    <AccountLink account={cid} textClassName="text-foreground max-w-60" />
  </Truncate>
);
