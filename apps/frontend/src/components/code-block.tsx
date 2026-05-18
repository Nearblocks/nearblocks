'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  code: string;
  language?: string;
  lineNumbers?: boolean;
  wrap?: boolean;
};

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const splitLines = (html: string): string[] => {
  const lines = html.split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines;
};

const loadPrism = async (language: string) => {
  const Prism = (await import('prismjs')).default;

  const loaders: Record<string, () => Promise<unknown>> = {
    // @ts-expect-error -- prismjs components lack type declarations
    json: () => import('prismjs/components/prism-json'),
    // @ts-expect-error -- prismjs components lack type declarations
    rust: () => import('prismjs/components/prism-rust'),
    // @ts-expect-error -- prismjs components lack type declarations
    toml: () => import('prismjs/components/prism-toml'),
  };

  if (loaders[language]) {
    await loaders[language]();
  }

  return Prism;
};

export const CodeBlock = ({
  className,
  code,
  language = 'plain',
  lineNumbers = false,
  wrap = false,
}: Props) => {
  const [lines, setLines] = useState<string[]>(() =>
    splitLines(escapeHtml(code)),
  );

  useEffect(() => {
    let cancelled = false;

    loadPrism(language)
      .then((Prism) => {
        if (cancelled) return;
        const grammar = Prism.languages[language];
        const html = grammar
          ? Prism.highlight(code, grammar, language)
          : escapeHtml(code);
        setLines(splitLines(html));
      })
      .catch(() => {
        if (!cancelled) setLines(splitLines(escapeHtml(code)));
      });

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  if (lineNumbers) {
    return (
      <table
        className={cn(
          'prism-code text-body-sm m-0 w-full border-collapse py-2 leading-relaxed',
          className,
        )}
      >
        <tbody>
          {lines.map((line, i) => (
            <tr key={i}>
              <td className="text-muted-foreground/50 sticky left-0 w-px bg-(--prism-bg) pr-3 pl-4 text-right align-top select-none">
                {i + 1}
              </td>
              <td
                className={cn(
                  'pr-4',
                  wrap ? 'break-words whitespace-pre-wrap' : 'whitespace-pre',
                )}
              >
                <code
                  className="text-body-sm"
                  dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <pre
      className={cn(
        'prism-code text-body-sm m-0 px-4 py-2 leading-relaxed',
        wrap ? 'break-words whitespace-pre-wrap' : 'whitespace-pre',
        className,
      )}
    >
      {lines.map((line, i) => (
        <code
          className={cn(
            'text-body-sm block',
            wrap ? 'break-words whitespace-pre-wrap' : 'whitespace-pre',
          )}
          dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
          key={i}
        />
      ))}
    </pre>
  );
};
