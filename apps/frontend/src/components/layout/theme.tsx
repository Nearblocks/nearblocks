'use client';

import { useTransition } from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';

import { setTheme } from '@/actions/theme';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/ui/button';

export const ThemeToggle = () => {
  const { t } = useLocale('layout');
  const theme = useConfig((c) => c.theme);
  const [isPending, startTransition] = useTransition();

  const onToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    startTransition(() => {
      setTheme(nextTheme);
    });
  };

  return (
    <Button
      disabled={isPending}
      onClick={onToggle}
      size="icon-xs"
      title={t('header.toggleTheme')}
      variant="secondary"
    >
      <LuMoon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <LuSun className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">{t('header.toggleTheme')}</span>
    </Button>
  );
};
