'use client';

import { useState } from 'react';

import { useLocale } from '@/hooks/use-locale';
import { useProtocolConfig } from '@/hooks/use-protocol-config';
import { mapAccountToShard } from '@/lib/shard-layout';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Field, FieldContent, FieldLabel, FieldSet } from '@/ui/field';
import { Input } from '@/ui/input';
import { Skeleton } from '@/ui/skeleton';

type ShardLayout = {
  V1?: { boundaryAccounts: string[] };
  V2?: { boundaryAccounts: string[] };
  V3?: { boundaryAccounts: string[] };
};

const getShardBoundaries = (layout: ShardLayout): string[] => {
  if ('V3' in layout && layout.V3) return layout.V3.boundaryAccounts;
  if ('V2' in layout && layout.V2) return layout.V2.boundaryAccounts;
  if ('V1' in layout && layout.V1) return layout.V1.boundaryAccounts;
  return [];
};

export const ShardMapperForm = () => {
  const { t } = useLocale('tools');
  const [account, setAccount] = useState('');

  const { data: protocolConfig, error: configError } = useProtocolConfig();
  const boundaries = protocolConfig?.shardLayout
    ? getShardBoundaries(protocolConfig.shardLayout as ShardLayout)
    : [];
  const shardCount = boundaries.length + 1;
  const shard =
    account.trim() && boundaries.length > 0
      ? mapAccountToShard(account.trim(), boundaries)
      : null;

  return (
    <div className="bg-card rounded-lg p-6">
      <h1 className="mb-1 text-xl font-semibold">{t('shard.title')}</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {t('shard.subtitle')}
      </p>

      <form className="max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <FieldSet>
          <Field>
            <FieldLabel htmlFor="account">{t('shard.account')}</FieldLabel>
            <FieldContent>
              <Input
                id="account"
                onChange={(e) => setAccount(e.target.value)}
                placeholder="example.near"
                value={account}
              />
            </FieldContent>
          </Field>

          <div>
            <Button
              onClick={() => setAccount('')}
              type="button"
              variant="outline"
            >
              {t('shard.reset')}
            </Button>
          </div>
        </FieldSet>
      </form>

      {configError && (
        <p className="text-destructive mt-4 max-w-xl text-sm">
          {configError instanceof Error ? configError.message : 'RPC error'}
        </p>
      )}

      {account.trim() && !protocolConfig && !configError && (
        <div className="mt-6 max-w-xl">
          <Skeleton className="h-8 w-40" />
        </div>
      )}

      {shard !== null && (
        <div className="bg-card border-border mt-6 max-w-xl rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <Badge variant="blue">
              {t('shard.shardOf', { count: shard, total: shardCount })}
            </Badge>
            <span className="text-muted-foreground font-mono text-sm break-all">
              {account.trim()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
