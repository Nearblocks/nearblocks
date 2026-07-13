import { Link } from '@/components/link';
import { cn } from '@/lib/utils';

type Props = {
  active?: boolean;
  children: React.ReactNode;
  href: string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseMove?: () => void;
};

export const SearchLink = ({
  active,
  children,
  href,
  id,
  onClick,
  onMouseMove,
}: Props) => {
  return (
    <Link
      aria-selected={active}
      className={cn(
        'text-headline-sm hover:bg-muted hover:text-link focus:bg-muted focus:text-link focus-visible:ring-ring/50 inline-block w-full flex-col gap-1 truncate rounded-sm p-2 align-middle transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1',
        'data-[active]:bg-muted data-[active]:text-link',
      )}
      data-active={active || undefined}
      href={href}
      id={id}
      onClick={onClick}
      onMouseMove={onMouseMove}
      role="option"
      tabIndex={-1}
    >
      {children}
    </Link>
  );
};
