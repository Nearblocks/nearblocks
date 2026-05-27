'use client';

import type { JsonData } from 'nb-schemas/src/common';
import { useState } from 'react';

import { Button } from '@/ui/button';

import { CodeViewer } from './code';
import { encodeValue, type Encoding, hasJsonValue } from './encode';

const ENCODINGS: { label: string; value: Encoding }[] = [
  { label: 'JSON', value: 'json' },
  { label: 'UTF-8', value: 'utf8' },
  { label: 'Hex', value: 'hex' },
  { label: 'Base64', value: 'base64' },
];

type Props = {
  base64?: string;
  className?: string;
  defaultEncoding?: Encoding;
  json?: JsonData;
  // When provided, a "Raw" toggle is shown. `rawCode` is the content to render
  // for it, and `onRawSelect` is fired when the user picks it (e.g. to fetch
  // the original payload over RPC).
  onRawSelect?: () => void;
  rawCode?: string;
};

export const EncodedData = ({
  base64,
  className,
  defaultEncoding = 'json',
  json,
  onRawSelect,
  rawCode,
}: Props) => {
  const [encoding, setEncoding] = useState<Encoding>(defaultEncoding);
  const hasValue = hasJsonValue(json);
  const showRaw = rawCode !== undefined || !!onRawSelect;

  const encodings = showRaw
    ? [...ENCODINGS, { label: 'Raw', value: 'raw' as Encoding }]
    : ENCODINGS;

  const code =
    encoding === 'raw'
      ? rawCode ?? ''
      : encodeValue(encoding, base64, json, hasValue);

  const onClick = (value: Encoding) => {
    setEncoding(value);
    if (value === 'raw') onRawSelect?.();
  };

  return (
    <CodeViewer
      className={className}
      code={code}
      language={encoding === 'json' ? 'json' : 'plain'}
      showByteSize
      toolbar={encodings.map(({ label, value }) => (
        <Button
          className="cursor-pointer border-0"
          key={value}
          onClick={() => onClick(value)}
          size="xs"
          variant={encoding === value ? 'secondary' : 'outline'}
        >
          {label}
        </Button>
      ))}
      tree={encoding === 'json'}
      wrap={encoding !== 'json'}
    />
  );
};
