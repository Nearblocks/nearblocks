'use client';

import { useState } from 'react';

import { useLocale } from '@/hooks/use-locale';
import { mapAccountToShard, SHARD_COUNT } from '@/lib/shard-layout';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Field, FieldContent, FieldLabel, FieldSet } from '@/ui/field';
import { Input } from '@/ui/input';

export const ShardMapperForm = () => {
  const { t } = useLocale('tools');
  const [account, setAccount] = useState('');

  const shard = account.trim() ? mapAccountToShard(account.trim()) : null;

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

      {shard !== null && (
        <div className="bg-card border-border mt-6 max-w-xl rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <Badge variant="blue">
              {t('shard.shardOf', { count: shard, total: SHARD_COUNT })}
            </Badge>
            <span className="text-muted-foreground font-mono text-sm break-all">
              {account.trim()}
            </span>
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            {t('shard.hint')}
          </p>
        </div>
      )}
    </div>
  );
};
