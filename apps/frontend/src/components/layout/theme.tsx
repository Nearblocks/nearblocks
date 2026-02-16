'use client';

import { Moon, Sun } from 'lucide-react';
import { useTransition } from 'react';

import { setTheme } from '@/actions/theme';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/ui/button';

export const ThemeToggle = () => {
  const theme = useTheme();
  const { t } = useLocale('layout');
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
      <Moon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Sun className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">{t('header.toggleTheme')}</span>
    </Button>
  );
};
