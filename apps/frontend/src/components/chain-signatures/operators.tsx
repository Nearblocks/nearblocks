'use client';

import { use } from 'react';

import { MCMpcParameters } from 'nb-schemas';

import { AccountLink, Link } from '@/components/link';
import { Truncate, TruncateText } from '@/components/truncate';
import { useLocale } from '@/hooks/use-locale';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';

import { Copy } from '../copy';

type Props = {
  loading?: boolean;
  mpcsPromise?: Promise<MCMpcParameters | null>;
};

export const Operators = ({ loading, mpcsPromise }: Props) => {
  const { t } = useLocale('chainSignatures');
  const mpcs = !loading && mpcsPromise ? use(mpcsPromise) : null;
  const isLoading = loading || !mpcs;
  const participants = mpcs?.participants ?? [];

  return (
    <Card>
      {mpcs && (
        <div className="text-body-sm border-b px-4 py-3">
          {t('operators.found', { count: participants.length })}
        </div>
      )}
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('operators.list.account')}</TableHead>
              <TableHead>{t('operators.list.publicKey')}</TableHead>
              <TableHead>{t('operators.list.url')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && !participants.length && (
              <TableRow>
                <TableCell
                  className="text-muted-foreground text-center"
                  colSpan={3}
                >
                  {t('operators.empty')}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              participants.map((participant) => (
                <TableRow key={participant.account}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AccountLink
                        account={participant.account}
                        textClassName="max-w-none"
                      />
                      {participant.is_validator && (
                        <Link href={`/validators/${participant.account}`}>
                          <Badge variant="lime">
                            {t('operators.validator')}
                          </Badge>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Truncate>
                      <TruncateText text={participant.public_key} />
                      <Copy text={participant.public_key} />
                    </Truncate>
                  </TableCell>
                  <TableCell>
                    {participant.url ? (
                      <Truncate>
                        <a
                          className="text-link"
                          href={participant.url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <TruncateText text={participant.url} />
                        </a>
                        <Copy text={participant.url} />
                      </Truncate>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
