'use client';

import { Moon, Sun } from 'lucide-react';

import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { applyTheme } from '@/lib/theme';
import { Button } from '@/ui/button';

export const ThemeToggle = () => {
  const theme = useTheme();
  const { t } = useLocale('layout');

  const onToggle = () => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      onClick={onToggle}
      size="icon-md"
      title={t('header.toggleTheme')}
      variant="secondary"
    >
      <Moon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Sun className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">{t('header.toggleTheme')}</span>
    </Button>
  );
};
