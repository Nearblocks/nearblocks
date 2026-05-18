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
        'border-border text-muted-foreground hover:text-primary hover:border-primary text-body-sm inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border px-2.5 transition-colors',
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
  <div className="border-border mb-6 flex items-center justify-between gap-3 border-b pb-3">
    <div className="flex items-center gap-2">
      <h1 className="text-body-lg">{title}</h1>
      {apiTag !== undefined && (
        <ApiBadge className="text-body-xs h-7 px-2" tag={apiTag} />
      )}
    </div>
    {children}
  </div>
);
