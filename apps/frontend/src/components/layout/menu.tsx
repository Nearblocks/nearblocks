'use client';

import { ActiveLink } from '@/components/active-link';
import { useLocale } from '@/hooks/use-locale';
import { NavMenu, RouteKey } from '@/types/types';
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

export const Menu = ({ menu }: Props) => {
  const { t } = useLocale('layout');

  return (
    <NavigationMenu className="z-1 hidden lg:block" viewport={false}>
      <NavigationMenuList className="flex-wrap">
        {menu.map((item) => (
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
                <NavigationMenuTrigger>
                  {item.key ? t(item.key) : item.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-40 gap-4">
                    <li>
                      {item.menu?.map((subItem) => (
                        <NavigationMenuLink
                          asChild
                          key={subItem.key || subItem.title}
                        >
                          <ActiveLink href={subItem.href}>
                            {subItem.key ? t(subItem.key) : subItem.title}
                          </ActiveLink>
                        </NavigationMenuLink>
                      ))}
                    </li>
                  </ul>
                </NavigationMenuContent>
              </>
            )}
          </NavigationMenuItem>
        ))}
        <li className="h-6">
          <Separator orientation="vertical" />
        </li>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Wallet className={navigationMenuTriggerStyle()} />
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
