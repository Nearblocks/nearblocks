import { Link, usePathname } from '@/i18n/routing';
import React, { Children, ReactElement, ReactNode } from 'react';
import { UrlObject } from 'url';

type LinkProps = Omit<typeof Link, 'locale'> & {
  locale?: any;
  className?: any;
  legacyBehavior?: boolean;
};

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
