import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import React, { Children, ReactElement, ReactNode } from 'react';
import { UrlObject } from 'url';

interface ActiveLinkProps extends LinkProps {
  children: ReactNode;
  activeClassName?: string;
  inActiveClassName?: string;
  href: string | UrlObject;
  exact?: boolean | null;
}

const ActiveLink = ({
  children,
  activeClassName,
  inActiveClassName,
  href,
  exact,
  ...props
}: ActiveLinkProps) => {
  const { asPath } = useRouter();

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
    <Link href={href} {...props} legacyBehavior>
      {React.cloneElement(child, {
        className: className || null,
      })}
    </Link>
  );
};

export default ActiveLink;
