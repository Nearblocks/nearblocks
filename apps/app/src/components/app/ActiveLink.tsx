import { UrlObject } from 'url';

import React, { Children, ReactElement, ReactNode } from 'react';

import { Link, usePathname } from '@/i18n/routing';

interface ActiveLinkProps {
  activeClassName?: string;
  children: ReactNode;
  exact?: boolean | null;
  href: string | UrlObject;
  inActiveClassName?: string;
  locale?: any;
}

const ActiveLink = ({
  activeClassName,
  children,
  exact,
  href,
  inActiveClassName,
  ...props
}: ActiveLinkProps) => {
  const asPath = usePathname();

  const child = Children.only(children) as ReactElement<any>;
  const childClassName = child?.props?.className || ' ';

  const hrefString = typeof href === 'string' ? href : href.pathname || '';

  let isActive = false;
  if (exact) {
    isActive = asPath === href;
  } else {
    isActive = href === '/' ? asPath === href : asPath.startsWith(hrefString);
  }
  const className = isActive
    ? `${childClassName} ${activeClassName}`
    : `${childClassName} ${inActiveClassName}`;

  return (
    <Link href={href} {...props}>
      {React.cloneElement(child, {
        className: className || null,
      })}
    </Link>
  );
};

export default ActiveLink;
