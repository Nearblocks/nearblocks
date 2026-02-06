'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  code: string;
  language?: string;
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

export const CodeBlock = ({ className, code, language = 'plain' }: Props) => {
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

  return (
    <table
      className={cn(
        'prism-code m-0 w-full border-collapse text-xs leading-relaxed',
        className,
      )}
    >
      <tbody>
        {lines.map((line, i) => (
          <tr key={i}>
            <td className="text-muted-foreground/50 sticky left-0 bg-(--prism-bg) pr-3 pl-4 text-right align-top select-none">
              {i + 1}
            </td>
            <td className="pr-4">
              <code dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
