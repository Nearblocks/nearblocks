'use client';

import { use } from 'react';

import { MCMpcParametersRes } from 'nb-schemas';

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
  mpcsPromise?: Promise<MCMpcParametersRes>;
};

export const Operators = ({ loading, mpcsPromise }: Props) => {
  const { t } = useLocale('chainSignatures');
  const mpcs = !loading && mpcsPromise ? use(mpcsPromise) : null;
  if (mpcs?.errors?.length) throw new Error('Failed to load MPC operators');
  const isLoading = !!loading;
  const participants = mpcs?.data?.participants ?? [];

  return (
    <Card>
      <div className="text-body-sm border-b px-4 py-3">
        {isLoading ? (
          <Skeleton className="w-40" />
        ) : (
          t('operators.found', { count: participants.length })
        )}
      </div>
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
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow className="h-15" key={index}>
                  <TableCell>
                    <Skeleton className="w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="w-40" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && !participants.length && (
              <TableRow className="h-15">
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
                <TableRow className="h-15" key={participant.account}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AccountLink
                        account={participant.account}
                        textClassName="max-w-none"
                      />
                      {participant.is_validator && (
                        <Link href={`/validators/${participant.account}`}>
                          <Badge
                            className="text-body-xs px-1.5 py-0.5"
                            variant="lime"
                          >
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
