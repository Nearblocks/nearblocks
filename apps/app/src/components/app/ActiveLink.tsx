import { UrlObject } from 'url';

import React, { Children, ReactElement, ReactNode } from 'react';

import { Link, usePathname } from '@/i18n/routing';

type LinkProps = Omit<typeof Link, 'locale'> & {
  className?: any;
  legacyBehavior?: boolean;
  locale?: any;
};

interface ActiveLinkProps extends LinkProps {
  activeClassName?: string;
  children: ReactNode;
  href: string | UrlObject;
  inActiveClassName?: string;
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
