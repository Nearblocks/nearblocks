'use client';

import { RiCollapseDiagonalLine, RiExpandDiagonalLine } from '@remixicon/react';
import { ChevronDown, ChevronRight, WrapText } from 'lucide-react';
import { useMemo, useState } from 'react';

import { CodeBlock } from '@/components/code-block';
import { Copy } from '@/components/copy';
import { JsonTree } from '@/components/json-tree';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  className?: string;
  code: string;
  language?: string;
  showByteSize?: boolean;
  toolbar?: React.ReactNode;
  tree?: boolean;
  wrap?: boolean;
};

export const CodeViewer = ({
  className,
  code,
  language = 'json',
  showByteSize = false,
  toolbar,
  tree = false,
  wrap: defaultWrap = true,
}: Props) => {
  const { t } = useLocale('txns');
  const [isFullHeight, setIsFullHeight] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [wrap, setWrap] = useState(defaultWrap);

  const parsed = useMemo(() => {
    if (!tree) return null;
    try {
      return JSON.parse(code);
    } catch {
      return null;
    }
  }, [tree, code]);

  const byteSize = useMemo(
    () => (showByteSize ? new Blob([code]).size : 0),
    [code, showByteSize],
  );

  return (
    <div className="w-full min-w-0 overflow-hidden rounded border bg-(--prism-bg)">
      <div className="bg-card/40 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b px-2 py-1">
        <button
          className="text-muted-foreground hover:text-foreground text-body-xs inline-flex shrink-0 items-center gap-1 whitespace-nowrap"
          onClick={() => setIsOpen((p) => !p)}
          type="button"
        >
          {isOpen ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
          {showByteSize
            ? `${isOpen ? 'Hide' : 'Show'} ${byteSize} bytes`
            : isOpen
            ? 'Hide'
            : 'Show'}
        </button>
        {isOpen && (
          <div className="flex items-center gap-0.5">
            {toolbar}
            <Copy className="text-muted-foreground" text={code} />
            {!tree && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className={cn(
                      'text-muted-foreground',
                      wrap && 'text-foreground',
                    )}
                    onClick={() => setWrap((p) => !p)}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <WrapText className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {wrap ? 'Disable line wrap' : 'Enable line wrap'}
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="text-muted-foreground"
                  onClick={() => setIsFullHeight((p) => !p)}
                  size="icon-xs"
                  variant="ghost"
                >
                  {isFullHeight ? (
                    <RiCollapseDiagonalLine className="size-3.5" />
                  ) : (
                    <RiExpandDiagonalLine className="size-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullHeight
                  ? t('codeViewer.collapse')
                  : t('codeViewer.expand')}
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
      {isOpen && (
        <div
          className={cn(
            'scroll-overlay min-h-12 overflow-auto',
            className,
            !isFullHeight && 'max-h-80',
          )}
        >
          {tree && parsed !== null ? (
            <JsonTree value={parsed} />
          ) : (
            <CodeBlock code={code} language={language} wrap={wrap} />
          )}
        </div>
      )}
    </div>
  );
};
