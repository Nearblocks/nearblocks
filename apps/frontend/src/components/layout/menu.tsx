'use client';

import { usePathname } from 'next/navigation';

import { ActiveLink } from '@/components/link';
import { useLocale } from '@/hooks/use-locale';
import { defaultLocale, supportedLocales } from '@/locales/config';
import { isNavMenuDivider, NavMenu, RouteKey } from '@/types/types';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/ui/navigation-menu';
import { Separator } from '@/ui/separator';

import { Wallet } from './wallet';

type Props = {
  menu: NavMenu<RouteKey<'layout'>>;
};

const stripLocale = (path: string): string => {
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0 && supportedLocales.some((l) => l === segments[0])) {
    return `/${segments.slice(1).join('/')}` || '/';
  }
  if (path === `/${defaultLocale}`) return '/';
  return path;
};

const isSubItemActive = (href: string, pathname: string): boolean =>
  href === pathname || pathname.startsWith(`${href}/`);

export const Menu = ({ menu }: Props) => {
  const { t } = useLocale('layout');
  const pathname = stripLocale(usePathname() ?? '/');

  return (
    <NavigationMenu className="z-1 hidden lg:block" viewport={false}>
      <NavigationMenuList className="flex-wrap">
        {menu.map((item) => {
          const hasActiveChild =
            item.menu?.some(
              (sub) =>
                !isNavMenuDivider(sub) &&
                sub.href &&
                isSubItemActive(sub.href, pathname),
            ) ?? false;

          return (
            <NavigationMenuItem key={item.key || item.title}>
              {item.href ? (
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <ActiveLink href={item.href}>
                    {item.key ? t(item.key) : item.title}
                  </ActiveLink>
                </NavigationMenuLink>
              ) : (
                <>
                  <NavigationMenuTrigger data-active={hasActiveChild}>
                    {item.key ? t(item.key) : item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-40 gap-4">
                      <li>
                        {item.menu?.map((subItem, idx) => {
                          if (isNavMenuDivider(subItem)) {
                            return (
                              <Separator
                                className="my-1"
                                key={`divider-${idx}`}
                              />
                            );
                          }
                          const isExternal =
                            subItem.href.startsWith('http://') ||
                            subItem.href.startsWith('https://');
                          return (
                            <NavigationMenuLink
                              asChild
                              key={subItem.key || subItem.title}
                            >
                              <ActiveLink
                                href={subItem.href}
                                rel={
                                  isExternal ? 'noopener noreferrer' : undefined
                                }
                                target={isExternal ? '_blank' : undefined}
                              >
                                {subItem.key ? t(subItem.key) : subItem.title}
                              </ActiveLink>
                            </NavigationMenuLink>
                          );
                        })}
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </>
              )}
            </NavigationMenuItem>
          );
        })}
        <li className="h-6">
          <Separator orientation="vertical" />
        </li>
        <NavigationMenuItem>
          <Wallet />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
