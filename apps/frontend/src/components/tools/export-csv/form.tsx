'use client';

import { Turnstile } from '@marsidev/react-turnstile';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ExportType } from 'nb-types';

const EXPORT_FILENAMES: Record<ExportType, string> = {
  [ExportType.FT_TRANSFERS]: 'ft-txns.csv',
  [ExportType.KEYS]: 'keys.csv',
  [ExportType.MT_TRANSFERS]: 'mt-txns.csv',
  [ExportType.NFT_TRANSFERS]: 'nft-txns.csv',
  [ExportType.RECEIPTS]: 'receipts.csv',
  [ExportType.STAKING]: 'staking-txns.csv',
  [ExportType.SUBACCOUNTS]: 'subaccounts.csv',
  [ExportType.TRANSACTIONS]: 'txns.csv',
};

import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
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
import { NativeSelect, NativeSelectOption } from '@/ui/native-select';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';

type FilterMode = 'block' | 'date';

type FormValues = {
  account: string;
  blockEnd: string;
  blockStart: string;
  dateEnd: string;
  dateStart: string;
  exportType: ExportType;
  filterMode: FilterMode;
};

type Props = {
  defaultAccount?: string;
  defaultType?: ExportType;
};

export const ExportCsvForm = ({ defaultAccount, defaultType }: Props) => {
  const { t } = useLocale('tools');
  const turnstileSiteKey = useConfig((state) => state.config.turnstileSiteKey);
  const tokenRef = useRef('');
  const [captchaReady, setCaptchaReady] = useState(false);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      account: defaultAccount ?? '',
      blockEnd: '',
      blockStart: '',
      dateEnd: '',
      dateStart: '',
      exportType: defaultType ?? ExportType.TRANSACTIONS,
      filterMode: 'date',
    },
  });

  const filterMode = watch('filterMode');

  const onSubmit = async (data: FormValues) => {
    const params = new URLSearchParams();
    params.set('type', data.exportType);
    params.set('account', data.account);
    params.set('token', tokenRef.current);

    if (data.filterMode === 'date') {
      params.set('filter', 'date');
      params.set('start', data.dateStart);
      params.set('end', data.dateEnd);
    } else {
      params.set('filter', 'block');
      params.set('block_start', data.blockStart);
      params.set('block_end', data.blockEnd);
    }

    const res = await fetch(`/api/export-csv?${params}`);

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast.error((json as { error?: string }).error ?? 'Export failed');
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = EXPORT_FILENAMES[data.exportType];
    a.click();
    URL.revokeObjectURL(url);
  };

  const onReset = () => {
    reset();
    tokenRef.current = '';
    setCaptchaReady(false);
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <h1 className="mb-1 text-xl font-semibold">{t('export.title')}</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {t('export.subtitle')}
      </p>

      <form className="max-w-xl" onSubmit={handleSubmit(onSubmit)}>
        <FieldSet>
          <Field className="w-full" data-invalid={!!errors.exportType}>
            <FieldLabel htmlFor="exportType">
              {t('export.exportTypeLabel')}
            </FieldLabel>
            <FieldContent className="w-full">
              <Controller
                control={control}
                name="exportType"
                render={({ field }) => (
                  <NativeSelect
                    className="w-full"
                    id="exportType"
                    onChange={(e) =>
                      field.onChange(e.target.value as ExportType)
                    }
                    value={field.value}
                  >
                    <NativeSelectOption value="transactions">
                      {t('export.types.transactions')}
                    </NativeSelectOption>
                    <NativeSelectOption value="receipts">
                      {t('export.types.receipts')}
                    </NativeSelectOption>
                    <NativeSelectOption value="ft_transfers">
                      {t('export.types.ft_transfers')}
                    </NativeSelectOption>
                    <NativeSelectOption value="nft_transfers">
                      {t('export.types.nft_transfers')}
                    </NativeSelectOption>
                    <NativeSelectOption value="mt_transfers">
                      {t('export.types.mt_transfers')}
                    </NativeSelectOption>
                    <NativeSelectOption value="staking">
                      {t('export.types.staking')}
                    </NativeSelectOption>
                    <NativeSelectOption value="keys">
                      {t('export.types.keys')}
                    </NativeSelectOption>
                    <NativeSelectOption value="subaccounts">
                      {t('export.types.subaccounts')}
                    </NativeSelectOption>
                  </NativeSelect>
                )}
              />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.account}>
            <FieldLabel htmlFor="account">
              {t('export.accountLabel')}
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
                    <Label htmlFor="filter-date">
                      {t('export.filterDate')}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="filter-block" value="block" />
                    <Label htmlFor="filter-block">
                      {t('export.filterBlock')}
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {filterMode === 'date' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.dateStart}>
                <FieldLabel htmlFor="dateStart">
                  {t('export.dateStart')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="dateStart"
                    type="date"
                    {...register('dateStart', {
                      required: 'Start date is required',
                    })}
                  />
                  <FieldError
                    errors={errors.dateStart ? [errors.dateStart] : []}
                  />
                </FieldContent>
              </Field>
              <Field data-invalid={!!errors.dateEnd}>
                <FieldLabel htmlFor="dateEnd">{t('export.dateEnd')}</FieldLabel>
                <FieldContent>
                  <Input
                    id="dateEnd"
                    type="date"
                    {...register('dateEnd', {
                      required: 'End date is required',
                      validate: (val, form) =>
                        !form.dateStart ||
                        val >= form.dateStart ||
                        'End must be after start',
                    })}
                  />
                  <FieldError errors={errors.dateEnd ? [errors.dateEnd] : []} />
                </FieldContent>
              </Field>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.blockStart}>
                <FieldLabel htmlFor="blockStart">
                  {t('export.blockStart')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="blockStart"
                    min="0"
                    type="number"
                    {...register('blockStart', {
                      required: 'Start block is required',
                    })}
                  />
                  <FieldError
                    errors={errors.blockStart ? [errors.blockStart] : []}
                  />
                </FieldContent>
              </Field>
              <Field data-invalid={!!errors.blockEnd}>
                <FieldLabel htmlFor="blockEnd">
                  {t('export.blockEnd')}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="blockEnd"
                    min="0"
                    type="number"
                    {...register('blockEnd', {
                      required: 'End block is required',
                      validate: (val, form) =>
                        !form.blockStart ||
                        Number(val) >= Number(form.blockStart) ||
                        'End must be after start',
                    })}
                  />
                  <FieldError
                    errors={errors.blockEnd ? [errors.blockEnd] : []}
                  />
                </FieldContent>
              </Field>
            </div>
          )}

          <div>
            {turnstileSiteKey && (
              <Turnstile
                onSuccess={(token) => {
                  tokenRef.current = token;
                  setCaptchaReady(true);
                }}
                siteKey={turnstileSiteKey}
              />
            )}
          </div>

          <div className="flex gap-3">
            <Button
              disabled={!captchaReady || isSubmitting}
              type="submit"
              variant="secondary"
            >
              {t('export.download')}
            </Button>
            <Button onClick={onReset} type="button" variant="outline">
              {t('export.reset')}
            </Button>
          </div>
        </FieldSet>
      </form>
    </div>
  );
};
