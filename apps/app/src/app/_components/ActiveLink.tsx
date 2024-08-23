import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import React, { Children, ReactElement, ReactNode } from 'react';
import { UrlObject } from 'url';

interface ActiveLinkProps extends LinkProps {
  children: ReactNode;
  activeClassName?: string;
  inActiveClassName?: string;
  href: string | UrlObject;
}

const ActiveLink = ({
  children,
  activeClassName,
  inActiveClassName,
  href,
  ...props
}: ActiveLinkProps) => {
  const pathname = usePathname();

  const child = Children.only(children) as ReactElement<any>;
  const childClassName = child?.props?.className || ' ';

  const hrefString = typeof href === 'string' ? href : href.pathname || '';

  const className = (
    href === '/' ? pathname === href : pathname?.startsWith(hrefString)
  )
    ? `${childClassName} ${activeClassName}`
    : `${childClassName} ${inActiveClassName}`;

  return (
    <Link href={href} {...props} legacyBehavior>
      {React.cloneElement(child, {
        className: className || null,
      })}
    </Link>
  );
};

export default ActiveLink;
