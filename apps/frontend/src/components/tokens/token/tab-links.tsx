'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { ActiveLink } from '@/components/link';
import { TabBadge, TabLink, TabLinks } from '@/components/tab-links';

type Props = {
  analytics: string;
  cid: string;
  faq: string;
  holders: string;
  info: string;
  transfers: string;
};

export const TokenTabLinks = ({
  analytics,
  cid,
  faq,
  holders,
  info,
  transfers,
}: Props) => {
  const account = useSearchParams().get('account');
  const pathname = usePathname();

  const analyticsBase = `/tokens/${cid}/analytics`;
  const analyticsActive = pathname.includes(analyticsBase);
  const analyticsHref = account
    ? `${analyticsBase}/transfers?account=${account}`
    : analyticsBase;

  const analyticsLink = (
    <TabLink asChild>
      <Link data-active={analyticsActive} href={analyticsHref}>
        {analytics}
        <TabBadge variant="teal">NEW</TabBadge>
      </Link>
    </TabLink>
  );

  if (account) {
    const transfersBase = `/tokens/${cid}`;
    const transfersActive =
      pathname === transfersBase || pathname.endsWith(`/${cid}`);

    return (
      <TabLinks>
        <TabLink asChild>
          <Link
            data-active={transfersActive}
            href={`${transfersBase}?account=${account}`}
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
        <ActiveLink exact href={`/tokens/${cid}`}>
          {transfers}
        </ActiveLink>
      </TabLink>
      <TabLink asChild>
        <ActiveLink href={`/tokens/${cid}/holders`}>{holders}</ActiveLink>
      </TabLink>
      <TabLink asChild>
        <ActiveLink href={`/tokens/${cid}/info`}>{info}</ActiveLink>
      </TabLink>
      <TabLink asChild>
        <ActiveLink href={`/tokens/${cid}/faq`}>{faq}</ActiveLink>
      </TabLink>
      {analyticsLink}
    </TabLinks>
  );
};
