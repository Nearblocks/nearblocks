import { UrlObject } from 'url';

import React, { Children, ReactElement, ReactNode } from 'react';

import { Link, usePathname } from '@/i18n/routing';

interface ActiveLinkProps {
  activeClassName?: string;
  children: ReactNode;
  className?: any;
  href: string | UrlObject;
  inActiveClassName?: string;
  legacyBehavior?: boolean;
  locale?: any;
}

const ActiveLink = ({
  activeClassName,
  children,
  href,
  inActiveClassName,
  legacyBehavior,
  ...props
}: ActiveLinkProps) => {
  const asPath = usePathname();

  const child = Children.only(children) as ReactElement<any>;
  const childClassName = child?.props?.className || ' ';

  const hrefString = typeof href === 'string' ? href : href.pathname || '';

  const className = (
    href === '/' ? asPath === href : asPath.startsWith(hrefString)
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
