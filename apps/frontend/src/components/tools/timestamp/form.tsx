'use client';

import { useState } from 'react';

import { Copy } from '@/components/copy';
import { useLocale } from '@/hooks/use-locale';
import { Dayjs } from '@/lib/dayjs';
import { Button } from '@/ui/button';
import { Field, FieldContent, FieldLabel, FieldSet } from '@/ui/field';
import { Input } from '@/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group';

type FieldKey = 'local' | 'ms' | 'ns' | 'utc';

const PICKER_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';

const fromMs = (ms: number): Record<FieldKey, string> => ({
  local: Dayjs(ms).format(PICKER_FORMAT),
  ms: String(ms),
  ns: (BigInt(ms) * 1_000_000n).toString(),
  utc: Dayjs.utc(ms).format(PICKER_FORMAT),
});

const DEFAULT = fromMs(Date.now());

const parseInput = (raw: string, field: FieldKey): null | number => {
  if (!raw) return null;
  try {
    if (field === 'ns') {
      const ns = BigInt(raw);
      return Number(ns / 1_000_000n);
    }
    if (field === 'ms') {
      const ms = Number(raw);
      if (!Number.isFinite(ms)) return null;
      return ms;
    }
    const parsed = field === 'utc' ? Dayjs.utc(raw) : Dayjs(raw);
    if (!parsed.isValid()) return null;
    return parsed.valueOf();
  } catch {
    return null;
  }
};

export const TimestampForm = () => {
  const { t } = useLocale('tools');
  const [values, setValues] = useState<Record<FieldKey, string>>(DEFAULT);
  const [invalid, setInvalid] = useState<FieldKey | null>(null);

  const onChange = (field: FieldKey, raw: string) => {
    if (!raw) {
      setValues({ local: '', ms: '', ns: '', utc: '' });
      setInvalid(null);
      return;
    }
    const ms = parseInput(raw, field);
    if (ms === null) {
      setValues((prev) => ({ ...prev, [field]: raw }));
      setInvalid(field);
      return;
    }
    setValues({ ...fromMs(ms), [field]: raw });
    setInvalid(null);
  };

  const onReset = () => {
    setValues(fromMs(Date.now()));
    setInvalid(null);
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <h1 className="mb-1 text-xl font-semibold">{t('timestamp.title')}</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {t('timestamp.subtitle')}
      </p>

      <form className="max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <FieldSet>
          {(['ns', 'ms'] as const).map((field) => (
            <Field data-invalid={invalid === field} key={field}>
              <FieldLabel htmlFor={field}>{t(`timestamp.${field}`)}</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    className="font-mono"
                    id={field}
                    onChange={(e) => onChange(field, e.target.value)}
                    value={values[field]}
                  />
                  <InputGroupAddon align="inline-end">
                    <Copy text={values[field]} />
                  </InputGroupAddon>
                </InputGroup>
              </FieldContent>
            </Field>
          ))}

          <Field data-invalid={invalid === 'utc'}>
            <FieldLabel htmlFor="utc">{t('timestamp.utc')}</FieldLabel>
            <FieldContent>
              <Input
                id="utc"
                onChange={(e) => onChange('utc', e.target.value)}
                step="0.001"
                type="datetime-local"
                value={values.utc}
              />
            </FieldContent>
          </Field>

          <Field data-invalid={invalid === 'local'}>
            <FieldLabel htmlFor="local">{t('timestamp.utcLocal')}</FieldLabel>
            <FieldContent>
              <Input
                id="local"
                onChange={(e) => onChange('local', e.target.value)}
                step="0.001"
                type="datetime-local"
                value={values.local}
              />
            </FieldContent>
          </Field>

          <div>
            <Button onClick={onReset} type="button" variant="outline">
              {t('timestamp.reset')}
            </Button>
          </div>
        </FieldSet>
      </form>
    </div>
  );
};
