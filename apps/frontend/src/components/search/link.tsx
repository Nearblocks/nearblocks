import { Link } from '@/components/link';

type Props = {
  children: React.ReactNode;
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export const SearchLink = ({ children, href, onClick }: Props) => {
  return (
    <Link
      className="text-headline-sm hover:bg-muted hover:text-link focus:bg-muted focus:text-link focus-visible:ring-ring/50 inline-block w-full flex-col gap-1 truncate rounded-sm p-2 align-middle transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      href={href}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};
