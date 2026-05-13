'use client';

import Big from 'big.js';
import { useState } from 'react';

import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { bytesFormat, nearFormat } from '@/lib/format';
import { Button } from '@/ui/button';
import { Field, FieldContent, FieldLabel, FieldSet } from '@/ui/field';
import { Input } from '@/ui/input';

const PRICE_PER_BYTE_YOCTO = Big('10000000000000000000');

export const StorageCostForm = () => {
  const { t } = useLocale('tools');
  const [bytes, setBytes] = useState('1000');
  const [invalid, setInvalid] = useState(false);

  const compute = () => {
    if (!bytes) return null;
    try {
      const b = Big(bytes);
      if (b.lt(0)) return null;
      return b.mul(PRICE_PER_BYTE_YOCTO);
    } catch {
      return null;
    }
  };

  const onChange = (raw: string) => {
    setBytes(raw);
    if (!raw) {
      setInvalid(false);
      return;
    }
    try {
      const b = Big(raw);
      setInvalid(b.lt(0));
    } catch {
      setInvalid(true);
    }
  };

  const yocto = compute();

  return (
    <div className="bg-card rounded-lg p-6">
      <h1 className="mb-1 text-xl font-semibold">{t('storageCost.title')}</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {t('storageCost.subtitle')}
      </p>

      <form className="max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <FieldSet>
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor="bytes">{t('storageCost.bytes')}</FieldLabel>
            <FieldContent>
              <Input
                id="bytes"
                inputMode="numeric"
                onChange={(e) => onChange(e.target.value)}
                placeholder="100000"
                value={bytes}
              />
            </FieldContent>
          </Field>

          <div>
            <Button
              onClick={() => {
                setBytes('');
                setInvalid(false);
              }}
              type="button"
              variant="outline"
            >
              {t('storageCost.reset')}
            </Button>
          </div>
        </FieldSet>
      </form>

      {yocto && (
        <div className="bg-card border-border mt-6 max-w-xl rounded-lg border p-6">
          <h2 className="mb-4 text-base font-semibold">
            {t('storageCost.resultTitle')}
          </h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-xs">
                {t('storageCost.size')}
              </dt>
              <dd className="mt-1 font-medium">{bytesFormat(bytes)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">
                {t('storageCost.depositNear')}
              </dt>
              <dd className="mt-1 flex items-center gap-1 font-medium">
                <NearCircle className="size-4 shrink-0" />
                {nearFormat(yocto.toFixed())}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground text-xs">
                {t('storageCost.depositYocto')}
              </dt>
              <dd className="mt-1 font-mono text-xs break-all">
                {yocto.toFixed()}
              </dd>
            </div>
          </dl>
          <p className="text-muted-foreground mt-4 text-xs">
            {t('storageCost.hint')}
          </p>
        </div>
      )}
    </div>
  );
};
