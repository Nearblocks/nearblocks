import { Link } from '@/components/link';

type Props = {
  children: React.ReactNode;
  href: string;
};

export const SearchLink = ({ children, href }: Props) => {
  return (
    <Link
      className="text-headline-sm hover:bg-muted hover:text-link focus:bg-muted focus:text-link focus-visible:ring-ring/50 flex flex-col gap-1 rounded-sm p-2 transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      href={href}
    >
      {children}
    </Link>
  );
};
