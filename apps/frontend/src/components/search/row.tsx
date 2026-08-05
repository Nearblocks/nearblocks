type Props = {
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
  title: React.ReactNode;
};

export const SearchRow = ({ icon, subtitle, title }: Props) => (
  <span className="flex min-w-0 items-center gap-2">
    {icon}
    <span className="flex min-w-0 flex-col">
      <span className="truncate">{title}</span>
      {subtitle && (
        <span className="text-body-xs text-muted-foreground truncate">
          {subtitle}
        </span>
      )}
    </span>
  </span>
);

type TokenTitleProps = {
  fallback: string;
  name?: null | string;
  symbol?: null | string;
};

export const TokenTitle = ({ fallback, name, symbol }: TokenTitleProps) => (
  <span className="flex min-w-0 items-center gap-1">
    <span className="inline-block max-w-28 min-w-0 truncate">
      {name ?? fallback}
    </span>
    {symbol && (
      <span className="text-muted-foreground flex min-w-0 items-center">
        (
        <span className="inline-block max-w-15 min-w-0 truncate">{symbol}</span>
        )
      </span>
    )}
  </span>
);
