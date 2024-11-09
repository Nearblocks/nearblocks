import React, { ReactNode } from 'react';

import { Link } from '@/i18n/routing';

import Check from '../Icons/Check';

type MenuProps = {
  children: ReactNode;
  className?: string;
};

type MenuItemProps = {
  className?: string;
  dropdown?: ReactNode;
  onClick?: () => void;
  trigger: ReactNode;
};

type MenuDropdownProps = {
  children?: ReactNode;
  className?: string;
};

type MenuTitleProps = {
  children: ReactNode;
  className?: string;
};

type MenuLinkProps = {
  checked: boolean;
  children: ReactNode;
  href: string;
};

type MenuButtonProps = {
  checked: boolean;
  children: ReactNode;
  onClick: () => void;
};

export const Menu = ({ children, className }: MenuProps) => {
  return (
    <nav>
      <ul className={className}>{children}</ul>
    </nav>
  );
};

export const MenuItem = ({
  className,
  dropdown,
  onClick,
  trigger,
}: MenuItemProps) => {
  return (
    <li className={`relative group ${className}`}>
      <button
        className="flex items-center hover:text-primary p-2"
        onClick={onClick}
      >
        {trigger}
      </button>
      {dropdown && dropdown}
    </li>
  );
};

export const MenuDropdown = ({ children, className }: MenuDropdownProps) => {
  return (
    <div className="hidden group-hover:block absolute top-full right-0">
      <ul className={`whitespace-nowrap text-sm pb-4 space-y-4 ${className}`}>
        {children}
      </ul>
    </div>
  );
};

export const MenuTitle = ({ children, className }: MenuTitleProps) => {
  return (
    <li
      className={`font-semibold px-6 md:px-4 py-2 border-y text-green-500 dark:text-green-250 ${className}`}
    >
      {children}
    </li>
  );
};

export const MenuLink = ({ checked, children, href }: MenuLinkProps) => {
  return (
    <li>
      <Link
        className={`flex items-center hover:text-primary pl-6 pr-6 md:pl-3 md:pr-6 ${
          checked && 'text-green-500'
        }`}
        href={href}
      >
        <span className="w-5">{checked && <Check className="w-3" />}</span>
        {children}
      </Link>
    </li>
  );
};

export const MenuButton = ({ checked, children, onClick }: MenuButtonProps) => {
  return (
    <li>
      <button
        className={`flex items-center whitespace-nowrap pl-3 pt-2 pr-6 md:pl-3 md:pr-6 hover:text-green-400 dark:text-neargray-10 dark:hover:text-green-250 ${
          checked && 'text-green-500'
        }`}
        onClick={onClick}
      >
        <span className="w-5 dark:text-green-250">
          {checked && <Check className="w-3" />}
        </span>
        {children}
      </button>
    </li>
  );
};
