'use client';

type Props = {
  button?: React.ReactNode;
  children: React.ReactNode;
  title: string;
};

export const SearchItem = ({ button, children, title }: Props) => {
  return (
    <>
      <div
        className="align-center flex justify-between p-2"
        role="presentation"
      >
        <div className="px-2 py-1 text-headline-xs text-muted-foreground">
          {title}
        </div>
        {button && button}
      </div>
      <div className="p-2">{children}</div>
    </>
  );
};
