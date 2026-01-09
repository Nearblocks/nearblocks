'use client';

import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/ui/empty';

import { Link } from './link';

type Props = {
  children?: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  showContact?: boolean;
  title?: string;
};

export const EmptyFooter = () => {
  const { t } = useLocale('layout');

  return (
    <>
      <EmptyContent>
        <Button asChild variant="secondary">
          <Link href="/">{t('errors.footer.button')}</Link>
        </Button>
      </EmptyContent>
      <div className="text-body-sm text-muted-foreground">
        {t('errors.footer.description')}{' '}
        <Link className="text-link underline" href="/contact">
          {t('errors.footer.link')}
        </Link>
      </div>
    </>
  );
};

export const EmptyBox = ({ children, description, icon, title }: Props) => {
  return (
    <Empty>
      <EmptyHeader>
        {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
        {title && <EmptyTitle>{title}</EmptyTitle>}
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {children}
    </Empty>
  );
};
