'use client';

import * as ed from '@noble/ed25519';
import bs58 from 'bs58';
import { useState } from 'react';

import { Copy } from '@/components/copy';
import { useLocale } from '@/hooks/use-locale';
import { Alert, AlertDescription } from '@/ui/alert';
import { Button } from '@/ui/button';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group';

type Keypair = {
  implicit: string;
  pub: string;
  secret: string;
};

const EMPTY: Keypair = { implicit: '—', pub: '—', secret: '—' };

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const generate = async (): Promise<Keypair> => {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const pub = await ed.getPublicKeyAsync(seed);
  const secretBytes = new Uint8Array(64);
  secretBytes.set(seed);
  secretBytes.set(pub, 32);
  return {
    implicit: toHex(pub),
    pub: `ed25519:${bs58.encode(pub)}`,
    secret: `ed25519:${bs58.encode(secretBytes)}`,
  };
};

const parsePasted = (raw: string): Keypair | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return { ...EMPTY, implicit: trimmed.toLowerCase() };
  }

  if (trimmed.startsWith('ed25519:')) {
    try {
      const bytes = bs58.decode(trimmed.slice('ed25519:'.length));
      if (bytes.length === 32) {
        return { implicit: toHex(bytes), pub: trimmed, secret: '—' };
      }
      if (bytes.length === 64) {
        const pub = bytes.slice(32);
        return {
          implicit: toHex(pub),
          pub: `ed25519:${bs58.encode(pub)}`,
          secret: trimmed,
        };
      }
    } catch {
      return null;
    }
  }

  return null;
};

export const KeypairForm = () => {
  const { t } = useLocale('tools');
  const [keypair, setKeypair] = useState<Keypair>(EMPTY);
  const [pasted, setPasted] = useState('');
  const [error, setError] = useState<null | string>(null);
  const [busy, setBusy] = useState(false);

  const onGenerate = async () => {
    setBusy(true);
    try {
      const next = await generate();
      setKeypair(next);
      setPasted('');
      setError(null);
    } finally {
      setBusy(false);
    }
  };

  const onPaste = (raw: string) => {
    setPasted(raw);
    if (!raw) {
      setKeypair(EMPTY);
      setError(null);
      return;
    }
    const parsed = parsePasted(raw);
    if (!parsed) {
      setKeypair(EMPTY);
      setError(t('keypair.invalid'));
      return;
    }
    setKeypair(parsed);
    setError(null);
  };

  const onReset = () => {
    setKeypair(EMPTY);
    setPasted('');
    setError(null);
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <h1 className="mb-1 text-xl font-semibold">{t('keypair.title')}</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {t('keypair.subtitle')}
      </p>

      <Alert className="bg-amber-background mb-6 border-0">
        <AlertDescription className="text-amber-foreground text-body-xs block">
          {t('keypair.warning')}
        </AlertDescription>
      </Alert>

      <form className="max-w-2xl" onSubmit={(e) => e.preventDefault()}>
        <FieldSet>
          <div className="flex gap-3">
            <Button
              disabled={busy}
              onClick={onGenerate}
              type="button"
              variant="secondary"
            >
              {t('keypair.generate')}
            </Button>
            <Button onClick={onReset} type="button" variant="outline">
              {t('keypair.reset')}
            </Button>
          </div>

          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="pasted">{t('keypair.pasteLabel')}</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  className="font-mono"
                  id="pasted"
                  onChange={(e) => onPaste(e.target.value)}
                  placeholder="ed25519:... or 64-char hex"
                  value={pasted}
                />
                <InputGroupAddon align="inline-end">
                  <Copy text={pasted} />
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={error ? [{ message: error }] : []} />
            </FieldContent>
          </Field>

          {(['secret', 'pub', 'implicit'] as const).map((key) => (
            <Field key={key}>
              <FieldLabel htmlFor={`out-${key}`}>
                {t(`keypair.${key}Label` as const)}
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupInput
                    className="font-mono"
                    id={`out-${key}`}
                    readOnly
                    value={keypair[key]}
                  />
                  <InputGroupAddon align="inline-end">
                    <Copy text={keypair[key]} />
                  </InputGroupAddon>
                </InputGroup>
              </FieldContent>
            </Field>
          ))}
        </FieldSet>
      </form>
    </div>
  );
};
