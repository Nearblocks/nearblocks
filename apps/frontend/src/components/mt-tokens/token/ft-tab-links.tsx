'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import { ActiveLink, Link } from '@/components/link';
import { TabBadge, TabLink, TabLinks } from '@/components/tab-links';
import { encodeToken } from '@/lib/utils';

type Props = {
  analytics: string;
  cid: string;
  holders: string;
  tid: string;
  transfers: string;
};

export const MtFtTabLinks = ({
  analytics,
  cid,
  holders,
  tid,
  transfers,
}: Props) => {
  const account = useSearchParams().get('account');
  const pathname = usePathname();

  const base = `/mt-tokens/${cid}/tokens/ft/${encodeToken(tid)}`;
  const analyticsActive = pathname.includes(`${base}/analytics`);
  const analyticsHref = account
    ? `${base}/analytics/transfers?account=${account}`
    : `${base}/analytics`;

  const analyticsLink = (
    <TabLink asChild>
      <Link data-active={analyticsActive} href={analyticsHref}>
        {analytics}
        <TabBadge variant="teal">NEW</TabBadge>
      </Link>
    </TabLink>
  );

  if (account) {
    const transfersActive =
      pathname === base || pathname.endsWith(`/ft/${encodeToken(tid)}`);

    return (
      <TabLinks>
        <TabLink asChild>
          <Link
            data-active={transfersActive}
            href={`${base}?account=${account}`}
          >
            {transfers}
          </Link>
        </TabLink>
        {analyticsLink}
      </TabLinks>
    );
  }

  return (
    <TabLinks>
      <TabLink asChild>
        <ActiveLink exact href={base}>
          {transfers}
        </ActiveLink>
      </TabLink>
      <TabLink asChild>
        <ActiveLink href={`${base}/holders`}>{holders}</ActiveLink>
      </TabLink>
      {analyticsLink}
    </TabLinks>
  );
};
