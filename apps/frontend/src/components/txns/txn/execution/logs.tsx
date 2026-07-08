import { CodeViewer } from './code';

type Props = {
  logs: unknown[];
};

const unicodeUnescape = (raw: string): string =>
  raw
    .replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/\\'/g, "'");

const beautify = (raw: string): string => {
  const trimmed = unicodeUnescape(raw).trim();

  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {}

  try {
    return JSON.stringify(JSON.parse(JSON.parse(`"${trimmed}"`)), null, 2);
  } catch {}

  const unescaped = trimmed
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"');

  try {
    return JSON.stringify(JSON.parse(unescaped), null, 2);
  } catch {
    return unescaped;
  }
};

export const ReceiptLogs = ({ logs }: Props) => {
  if (logs.length === 0) {
    return <p className="text-muted-foreground py-1">No Logs</p>;
  }

  const combined = logs
    .map((log) => {
      const text = String(log);
      const eventPrefix = 'EVENT_JSON:';
      return text.startsWith(eventPrefix)
        ? beautify(text.slice(eventPrefix.length))
        : beautify(text);
    })
    .join('\n\n');

  return (
    <CodeViewer className="min-h-12" code={combined} language="json" wrap />
  );
};
