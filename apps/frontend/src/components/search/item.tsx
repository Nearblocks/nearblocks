'use client';

import { Separator } from '@/ui/separator';

type Props = {
  button?: React.ReactNode;
  children: React.ReactNode;
  title: string;
};

export const SearchItem = ({ button, children, title }: Props) => {
  return (
    <>
      <div className="align-center flex justify-between p-2">
        <div className="text-headline-xs text-muted-foreground px-2 py-1">
          {title}
        </div>
        {button && button}
      </div>
      <Separator className="bg-border" orientation="horizontal" />
      <div className="p-2">{children}</div>
    </>
  );
};
