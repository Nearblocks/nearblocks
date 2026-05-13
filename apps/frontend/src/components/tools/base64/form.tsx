'use client';

import { useState } from 'react';

import { Copy } from '@/components/copy';
import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/ui/button';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from '@/ui/input-group';

const decodeBase64 = (b64: string) =>
  new TextDecoder().decode(
    Uint8Array.from(atob(b64.trim()), (c) => c.charCodeAt(0)),
  );

const encodeBase64 = (text: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(text)));

const prettyJson = (text: string) => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
};

const DEFAULT_SOURCE = 'eyJhY2NvdW50X2lkIjoidGVzdC5uZWFyIn0=';
const DEFAULT_DECODED = (() => {
  try {
    return prettyJson(decodeBase64(DEFAULT_SOURCE));
  } catch {
    return '';
  }
})();

export const Base64Form = () => {
  const { t } = useLocale('tools');
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [decoded, setDecoded] = useState(DEFAULT_DECODED);
  const [error, setError] = useState<null | string>(null);

  const onDecode = () => {
    if (!source) return;
    try {
      setDecoded(prettyJson(decodeBase64(source)));
      setError(null);
    } catch {
      setError(t('base64.invalid'));
    }
  };

  const onEncode = () => {
    if (!decoded) return;
    setSource(encodeBase64(decoded));
    setError(null);
  };

  const onReset = () => {
    setSource('');
    setDecoded('');
    setError(null);
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <h1 className="mb-1 text-xl font-semibold">{t('base64.title')}</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {t('base64.subtitle')}
      </p>

      <form className="max-w-2xl" onSubmit={(e) => e.preventDefault()}>
        <FieldSet>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="source">{t('base64.sourceLabel')}</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupTextarea
                  id="source"
                  onChange={(e) => {
                    setSource(e.target.value);
                    setError(null);
                  }}
                  rows={6}
                  value={source}
                />
                <InputGroupAddon align="block-end">
                  <Copy text={source} />
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={error ? [{ message: error }] : []} />
            </FieldContent>
          </Field>

          <div className="flex gap-3">
            <Button onClick={onDecode} type="button" variant="secondary">
              {t('base64.decode')}
            </Button>
            <Button onClick={onEncode} type="button" variant="secondary">
              {t('base64.encode')}
            </Button>
          </div>

          <Field>
            <FieldLabel htmlFor="decoded">
              {t('base64.decodedLabel')}
            </FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupTextarea
                  className="font-mono"
                  id="decoded"
                  onChange={(e) => setDecoded(e.target.value)}
                  rows={8}
                  value={decoded}
                />
                <InputGroupAddon align="block-end">
                  <Copy text={decoded} />
                </InputGroupAddon>
              </InputGroup>
            </FieldContent>
          </Field>

          <div>
            <Button onClick={onReset} type="button" variant="outline">
              {t('base64.reset')}
            </Button>
          </div>
        </FieldSet>
      </form>
    </div>
  );
};
