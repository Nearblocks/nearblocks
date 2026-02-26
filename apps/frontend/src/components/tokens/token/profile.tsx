'use client';

import {
  RiFacebookCircleFill,
  RiRedditLine,
  RiTelegram2Line,
  RiTwitterXLine,
} from '@remixicon/react';
import { use } from 'react';

import { FTContractRes } from 'nb-schemas';

import { AccountLink, Link } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

const toSocialUrl = (value: string, base: string) =>
  value.startsWith('http://') || value.startsWith('https://')
    ? value
    : `${base}${value}`;

type Props = {
  contractPromise?: Promise<FTContractRes>;
  loading?: boolean;
  token: string;
};

export const Profile = ({ contractPromise, loading, token }: Props) => {
  const result = !loading && contractPromise ? use(contractPromise) : null;
  const contract = result?.data ?? null;

  const hasSocials =
    contract?.twitter ||
    contract?.facebook ||
    contract?.telegram ||
    contract?.reddit;

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">Profile Summary</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-28">Contract:</ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="h-7 w-40" />}
                loading={loading || !contract}
              >
                {() => <AccountLink account={token} textClassName="max-w-60" />}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-28">Decimals:</ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="w-8" />}
                loading={loading || !contract}
              >
                {() => (
                  <>
                    {contract?.decimals != null ? (
                      contract.decimals
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </>
                )}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-28">Official Site:</ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="w-32" />}
                loading={loading || !contract}
              >
                {() => (
                  <>
                    {contract?.website ? (
                      <a
                        className="text-link"
                        href={contract.website}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {contract.website}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </>
                )}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-28">Social Profiles:</ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="w-24" />}
                loading={loading || !contract}
              >
                {() =>
                  hasSocials ? (
                    <span className="flex h-6 items-center gap-2">
                      {contract?.twitter && (
                        <Link
                          className="text-link"
                          href={toSocialUrl(contract.twitter, 'https://x.com/')}
                          rel="noopener noreferrer"
                          target="_blank"
                          title="X"
                        >
                          <RiTwitterXLine className="size-4.5" />
                        </Link>
                      )}
                      {contract?.facebook && (
                        <Link
                          className="text-link"
                          href={toSocialUrl(
                            contract.facebook,
                            'https://facebook.com/',
                          )}
                          rel="noopener noreferrer"
                          target="_blank"
                          title="Facebook"
                        >
                          <RiFacebookCircleFill className="size-5" />
                        </Link>
                      )}
                      {contract?.telegram && (
                        <Link
                          className="text-link"
                          href={toSocialUrl(contract.telegram, 'https://t.me/')}
                          rel="noopener noreferrer"
                          target="_blank"
                          title="Telegram"
                        >
                          <RiTelegram2Line className="size-5" />
                        </Link>
                      )}
                      {contract?.reddit && (
                        <Link
                          className="text-link"
                          href={toSocialUrl(
                            contract.reddit,
                            'https://reddit.com/r/',
                          )}
                          rel="noopener noreferrer"
                          target="_blank"
                          title="Reddit"
                        >
                          <RiRedditLine className="size-5" />
                        </Link>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )
                }
              </SkeletonSlot>
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
