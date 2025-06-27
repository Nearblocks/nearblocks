import { UrlObject } from 'url';

import React, { Children, ReactElement, ReactNode } from 'react';

import { Link, usePathname } from '@/i18n/routing';

interface ActiveLinkProps {
  activeClassName?: string;
  children: ReactNode;
  exact?: boolean | null;
  hasSubmenu?: boolean;
  href: string | UrlObject;
  inActiveClassName?: string;
  locale?: any;
  submenuPaths?: string[];
}

const ActiveLink = ({
  activeClassName,
  children,
  exact,
  hasSubmenu = false,
  href,
  inActiveClassName,
  submenuPaths = [],
  ...props
}: ActiveLinkProps) => {
  const asPath = usePathname();
  const child = Children.only(children) as ReactElement<any>;
  const childClassName = child?.props?.className || ' ';
  const hrefString = typeof href === 'string' ? href : href.pathname || '';

  const isActive = (() => {
    if (hasSubmenu && submenuPaths.length > 0) {
      return (
        submenuPaths.some((path) => asPath === path) || asPath === hrefString
      );
    }

    if (exact) {
      return asPath === hrefString;
    }

    return hrefString === '/' ? asPath === hrefString : asPath === hrefString;
  })();

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
