'use client';

import { RiCollapseDiagonalLine, RiExpandDiagonalLine } from '@remixicon/react';
import { useState } from 'react';

import { CodeBlock } from '@/components/code-block';
import { Copy } from '@/components/copy';
import { ToggleGroup } from '@/components/toggle-group';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  className?: string;
  code: string;
  language?: string;
  toolbar?: React.ReactNode;
};

export const CodeViewer = ({
  className,
  code,
  language = 'json',
  toolbar,
}: Props) => {
  const [isFullHeight, setIsFullHeight] = useState(false);

  return (
    <div className="relative rounded border">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5">
        <ToggleGroup>
          {toolbar}
          <Copy className="text-muted-foreground" text={code} />
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
              {isFullHeight ? 'Collapse' : 'Expand'}
            </TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </div>
      <div
        className={cn(
          'scroll-overlay min-h-35 overflow-auto',
          className,
          !isFullHeight && 'max-h-35',
        )}
      >
        <CodeBlock code={code} language={language} />
      </div>
    </div>
  );
};
