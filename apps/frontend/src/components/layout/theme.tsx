'use client';

import { useTransition } from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';

import { setTheme } from '@/actions/theme';
import { useConfig } from '@/hooks/use-config';
import { Button } from '@/ui/button';

export const ThemeToggle = () => {
  const config = useConfig();
  const [isPending, startTransition] = useTransition();

  const onToggle = () => {
    startTransition(() => {
      setTheme(config.theme === 'dark' ? 'light' : 'dark');
    });
  };

  return (
    <Button
      disabled={isPending}
      onClick={onToggle}
      size="icon-xs"
      title="Toggle theme"
      variant="secondary"
    >
      <LuMoon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <LuSun className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
