'use client';

import { Code2 } from 'lucide-react';
import { ReactNode } from 'react';

import { useConfig } from '@/hooks/use-config';
import { cn } from '@/lib/utils';

const apiDocsUrl = (network: 'mainnet' | 'testnet', tag?: string) => {
  const base =
    network === 'mainnet'
      ? 'https://api.nearblocks.io/api-docs'
      : 'https://api-testnet.nearblocks.io/api-docs';
  return tag ? `${base}#tag/${tag}` : base;
};

export const ApiBadge = ({
  className,
  tag,
}: {
  className?: string;
  tag?: string;
}) => {
  const network = useConfig((s) => s.config.network);
  return (
    <a
      className={cn(
        'border-border text-muted-foreground hover:text-primary hover:border-primary text-body-sm inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-md border px-2.5 whitespace-nowrap transition-colors',
        className,
      )}
      href={apiDocsUrl(network, tag)}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Code2 className="size-3.5" />
      API
    </a>
  );
};

type Props = {
  apiTag?: string;
  children?: ReactNode;
  title: ReactNode;
};

export const PageHeading = ({ apiTag, children, title }: Props) => (
  <div className="border-border mb-3 flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
    <h1 className="text-body-lg min-w-0">{title}</h1>
    {(apiTag !== undefined || children) && (
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {apiTag !== undefined && (
          <ApiBadge
            className="text-body-xs hidden h-7 px-2 sm:inline-flex"
            tag={apiTag}
          />
        )}
        {children}
      </div>
    )}
  </div>
);
