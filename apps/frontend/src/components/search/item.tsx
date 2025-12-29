'use client';

import { Separator } from '@/ui/separator';

type Props = {
  children: React.ReactNode;
  title: string;
};

export const SearchItem = ({ children, title }: Props) => {
  return (
    <>
      <div className="p-2">
        <div className="text-headline-xs text-muted-foreground px-2 py-1">
          {title}
        </div>
      </div>
      <Separator className="bg-border" orientation="horizontal" />
      <div className="p-2">{children}</div>
    </>
  );
};
