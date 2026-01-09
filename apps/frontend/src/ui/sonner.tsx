'use client';

import {
  LuCircleCheck,
  LuInfo,
  LuLoaderCircle,
  LuOctagonX,
  LuTriangleAlert,
} from 'react-icons/lu';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { useConfig } from '@/hooks/use-config';

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useConfig((c) => c.theme);

  return (
    <Sonner
      className="toaster group"
      icons={{
        error: <LuOctagonX className="size-4" />,
        info: <LuInfo className="size-4" />,
        loading: <LuLoaderCircle className="size-4 animate-spin" />,
        success: <LuCircleCheck className="size-4" />,
        warning: <LuTriangleAlert className="size-4" />,
      }}
      style={
        {
          '--border-radius': 'var(--radius)',
          '--normal-bg': 'var(--popover)',
          '--normal-border': 'var(--border)',
          '--normal-text': 'var(--popover-foreground)',
        } as React.CSSProperties
      }
      theme={theme as ToasterProps['theme']}
      {...props}
    />
  );
};

export { Toaster };
