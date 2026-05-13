'use client';

import Big from 'big.js';
import { useState } from 'react';

import { Copy } from '@/components/copy';
import { useLocale } from '@/hooks/use-locale';
import { toNear, toYocto } from '@/lib/format';
import { Button } from '@/ui/button';
import { Field, FieldContent, FieldLabel, FieldSet } from '@/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group';

type Field = 'near' | 'yocto';

const DEFAULT: Record<Field, string> = {
  near: '1',
  yocto: '1000000000000000000000000',
};

const tryConvert = (value: string, from: Field) => {
  if (!value) return { near: '', yocto: '' };
  try {
    const big = Big(value);
    if (big.lt(0)) throw new Error('negative');
    if (from === 'near') {
      return { near: value, yocto: Big(toYocto(big)).toFixed() };
    }
    return { near: Big(toNear(big)).toFixed(), yocto: value };
  } catch {
    return null;
  }
};

export const UnitConverterForm = () => {
  const { t } = useLocale('tools');
  const [values, setValues] = useState<Record<Field, string>>(DEFAULT);
  const [invalid, setInvalid] = useState<Field | null>(null);

  const onChange = (field: Field, raw: string) => {
    if (!raw) {
      setValues({ near: '', yocto: '' });
      setInvalid(null);
      return;
    }
    const result = tryConvert(raw, field);
    if (!result) {
      setValues((prev) => ({ ...prev, [field]: raw }));
      setInvalid(field);
      return;
    }
    setValues(result);
    setInvalid(null);
  };

  const onReset = () => {
    setValues(DEFAULT);
    setInvalid(null);
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <h1 className="mb-1 text-xl font-semibold">{t('units.title')}</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {t('units.subtitle')}
      </p>

      <form className="max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <FieldSet>
          <Field data-invalid={invalid === 'near'}>
            <FieldLabel htmlFor="near">{t('units.near')}</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  id="near"
                  inputMode="decimal"
                  onChange={(e) => onChange('near', e.target.value)}
                  value={values.near}
                />
                <InputGroupAddon align="inline-end">
                  <Copy text={values.near} />
                </InputGroupAddon>
              </InputGroup>
            </FieldContent>
          </Field>

          <Field data-invalid={invalid === 'yocto'}>
            <FieldLabel htmlFor="yocto">{t('units.yocto')}</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  id="yocto"
                  inputMode="numeric"
                  onChange={(e) => onChange('yocto', e.target.value)}
                  value={values.yocto}
                />
                <InputGroupAddon align="inline-end">
                  <Copy text={values.yocto} />
                </InputGroupAddon>
              </InputGroup>
            </FieldContent>
          </Field>

          <div>
            <Button onClick={onReset} type="button" variant="outline">
              {t('units.reset')}
            </Button>
          </div>
        </FieldSet>
      </form>
    </div>
  );
};
