import { CodeViewer } from './code';

type Props = {
  logs: unknown[];
};

const beautify = (raw: string): string => {
  const unescaped = raw
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .trim();

  try {
    return JSON.stringify(JSON.parse(unescaped), null, 2);
  } catch {
    return unescaped;
  }
};

export const ReceiptLogs = ({ logs }: Props) => {
  if (logs.length === 0) {
    return <CodeViewer className="min-h-12" code="" language="json" />;
  }

  return logs.map((log, i) => {
    const text = String(log);
    const eventPrefix = 'EVENT_JSON:';
    const display = text.startsWith(eventPrefix)
      ? beautify(text.slice(eventPrefix.length))
      : beautify(text);

    return (
      <CodeViewer className="min-h-12" code={display} key={i} language="json" />
    );
  });
};
