'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { AccountBalance } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { bytesFormat, dateFormat, nearFormat, toMs } from '@/lib/format';
import { Button } from '@/ui/button';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@/ui/field';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';

type FilterMode = 'block' | 'date';

type FormValues = {
  account: string;
  block: string;
  date: string;
  filterMode: FilterMode;
};

type ResultState = 'not_found' | AccountBalance | null;

export const AccountBalanceForm = () => {
  const { t } = useLocale('tools');
  const [result, setResult] = useState<ResultState>(null);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      account: '',
      block: '',
      date: '',
      filterMode: 'date',
    },
  });

  const filterMode = watch('filterMode');

  const onSubmit = async (data: FormValues) => {
    setResult(null);
    try {
      const params = new URLSearchParams({ account: data.account });
      if (data.filterMode === 'date') {
        params.set('date', data.date);
      } else {
        params.set('block', data.block);
      }
      const res = await fetch(`/api/account-balance?${params}`);
      const json = await res.json();
      if (!res.ok || !json.data) {
        setResult('not_found');
      } else {
        setResult(json.data as AccountBalance);
      }
    } catch {
      setResult('not_found');
    }
  };

  const onReset = () => {
    reset();
    setResult(null);
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <h1 className="mb-1 text-xl font-semibold">{t('balance.title')}</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {t('balance.subtitle')}
      </p>

      <form className="max-w-xl" onSubmit={handleSubmit(onSubmit)}>
        <FieldSet>
          <Field data-invalid={!!errors.account}>
            <FieldLabel htmlFor="account">
              {t('balance.accountLabel')}
            </FieldLabel>
            <FieldContent>
              <Input
                id="account"
                placeholder="account.near"
                {...register('account', { required: 'Account is required' })}
              />
              <FieldError errors={errors.account ? [errors.account] : []} />
            </FieldContent>
          </Field>

          <div>
            <p className="mb-2 text-sm font-medium">
              {t('balance.filterMode')}
            </p>
            <Controller
              control={control}
              name="filterMode"
              render={({ field }) => (
                <RadioGroup
                  className="flex flex-row gap-6"
                  onValueChange={(v) => field.onChange(v as FilterMode)}
                  value={field.value}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="filter-date" value="date" />
                    <Label htmlFor="filter-date">{t('balance.dateMode')}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="filter-block" value="block" />
                    <Label htmlFor="filter-block">
                      {t('balance.blockMode')}
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {filterMode === 'date' ? (
            <Field data-invalid={!!errors.date}>
              <FieldLabel htmlFor="date">{t('balance.dateInput')}</FieldLabel>
              <FieldContent>
                <Input
                  id="date"
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                />
                <FieldError errors={errors.date ? [errors.date] : []} />
              </FieldContent>
            </Field>
          ) : (
            <Field data-invalid={!!errors.block}>
              <FieldLabel htmlFor="block">{t('balance.blockInput')}</FieldLabel>
              <FieldContent>
                <Input
                  id="block"
                  min="0"
                  placeholder="120000000"
                  type="number"
                  {...register('block', {
                    required: 'Block height is required',
                  })}
                />
                <FieldError errors={errors.block ? [errors.block] : []} />
              </FieldContent>
            </Field>
          )}

          <div className="flex gap-3">
            <Button disabled={isSubmitting} type="submit" variant="secondary">
              {t('balance.check')}
            </Button>
            <Button onClick={onReset} type="button" variant="outline">
              {t('balance.reset')}
            </Button>
          </div>
        </FieldSet>
      </form>

      {result === 'not_found' && (
        <div className="bg-muted mt-6 max-w-xl rounded-lg p-4 text-sm">
          {t('balance.notFound')}
        </div>
      )}

      {result && result !== 'not_found' && (
        <div className="bg-card border-border mt-6 max-w-xl rounded-lg border p-6">
          <h2 className="mb-4 text-base font-semibold">
            {t('balance.resultTitle')}
          </h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-xs">
                {t('balance.resultTotal')}
              </dt>
              <dd className="mt-1 flex items-center gap-1 font-medium">
                <NearCircle className="size-4 shrink-0" />
                {nearFormat(result.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">
                {t('balance.resultStaked')}
              </dt>
              <dd className="mt-1 flex items-center gap-1 font-medium">
                <NearCircle className="size-4 shrink-0" />
                {nearFormat(result.amount_staked)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">
                {t('balance.resultStorage')}
              </dt>
              <dd className="mt-1 font-medium">
                {bytesFormat(result.storage_usage)}
              </dd>
            </div>
            {result.block_height && (
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t('balance.resultBlockHeight')}
                </dt>
                <dd className="mt-1 font-medium">{result.block_height}</dd>
              </div>
            )}
            {result.block_timestamp && (
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t('balance.resultBlockTimestamp')}
                </dt>
                <dd className="mt-1 font-medium">
                  {dateFormat(
                    toMs(result.block_timestamp),
                    'YYYY-MM-DD HH:mm:ss',
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
};
