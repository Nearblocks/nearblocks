'use client';

import Big from 'big.js';
import { useState } from 'react';

import { Copy } from '@/components/copy';
import { useLocale } from '@/hooks/use-locale';
import { numberFormat } from '@/lib/format';
import { Button } from '@/ui/button';
import { Field, FieldContent, FieldLabel, FieldSet } from '@/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group';

type Field = 'gas' | 'ggas' | 'pgas' | 'tgas';

const POWERS: Record<Field, number> = {
  gas: 0,
  ggas: 9,
  pgas: 15,
  tgas: 12,
};

const empty: Record<Field, string> = { gas: '', ggas: '', pgas: '', tgas: '' };

const fromCanonical = (gas: Big): Record<Field, string> => ({
  gas: gas.toFixed(),
  ggas: gas.div(Big(10).pow(POWERS.ggas)).toFixed(),
  pgas: gas.div(Big(10).pow(POWERS.pgas)).toFixed(),
  tgas: gas.div(Big(10).pow(POWERS.tgas)).toFixed(),
});

const DEFAULT: Record<Field, string> = {
  ...fromCanonical(Big(10).pow(12)),
  tgas: '1',
};

const tryConvert = (value: string, from: Field) => {
  if (!value) return empty;
  try {
    const big = Big(value);
    if (big.lt(0)) throw new Error('negative');
    const gas = big.mul(Big(10).pow(POWERS[from]));
    return { ...fromCanonical(gas), [from]: value };
  } catch {
    return null;
  }
};

const computeTimeMs = (gasStr: string): null | string => {
  if (!gasStr) return null;
  try {
    const ms = Big(gasStr).div(Big(10).pow(12));
    return numberFormat(ms.toString(), { maximumFractionDigits: 3 });
  } catch {
    return null;
  }
};

export const GasConverterForm = () => {
  const { t } = useLocale('tools');
  const [values, setValues] = useState<Record<Field, string>>(DEFAULT);
  const [invalid, setInvalid] = useState<Field | null>(null);

  const onChange = (field: Field, raw: string) => {
    if (!raw) {
      setValues(empty);
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

  const ms = computeTimeMs(values.gas);

  return (
    <div className="bg-card rounded-lg p-6">
      <h1 className="mb-1 text-xl font-semibold">{t('gas.title')}</h1>
      <p className="text-muted-foreground mb-6 text-sm">{t('gas.subtitle')}</p>

      <form className="max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <FieldSet>
          {(['gas', 'ggas', 'tgas', 'pgas'] as const).map((field) => (
            <Field data-invalid={invalid === field} key={field}>
              <FieldLabel htmlFor={field}>{t(`gas.${field}`)}</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    id={field}
                    inputMode="decimal"
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

          {ms !== null && (
            <p className="text-muted-foreground text-sm">
              {t('gas.hint')} ≈ {ms} ms
            </p>
          )}

          <div>
            <Button onClick={onReset} type="button" variant="outline">
              {t('gas.reset')}
            </Button>
          </div>
        </FieldSet>
      </form>
    </div>
  );
};
