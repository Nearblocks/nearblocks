'use client';

import { ChevronRight } from 'lucide-react';

import { useLocale } from '@/hooks/use-locale';
import { isNavMenuDivider, NavMenu, RouteKey } from '@/types/types';
import { Collapsible, CollapsibleContent } from '@/ui/collapsible';
import {
  mobileNavigationCollapsibleTriggerStyle,
  MobileNavigationMenu,
  MobileNavigationMenuCollapsibleTrigger,
  MobileNavigationMenuItem,
  MobileNavigationMenuLink,
} from '@/ui/mobile-navigation-menu';
import { Separator } from '@/ui/separator';

import { Wallet } from './wallet';

type Props = {
  menu: NavMenu<RouteKey<'layout'>>;
};

export const MobileMenu = ({ menu }: Props) => {
  const { t } = useLocale('layout');

  return (
    <MobileNavigationMenu>
      {menu.map((item) =>
        item.href ? (
          <MobileNavigationMenuItem key={item.title || item.key}>
            <MobileNavigationMenuLink href={item.href}>
              {item.key ? t(item.key) : item.title}
            </MobileNavigationMenuLink>
          </MobileNavigationMenuItem>
        ) : (
          <Collapsible asChild key={item.title || item.key}>
            <MobileNavigationMenuItem>
              <MobileNavigationMenuCollapsibleTrigger>
                <span>{item.key ? t(item.key) : item.title}</span>
                <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
              </MobileNavigationMenuCollapsibleTrigger>
              <CollapsibleContent>
                <ul className="border-border my-2 ml-4 border-l pl-2">
                  {item.menu?.map((subItem, idx) => {
                    if (isNavMenuDivider(subItem)) {
                      return (
                        <li className="my-1" key={`divider-${idx}`}>
                          <Separator orientation="horizontal" />
                        </li>
                      );
                    }
                    const isExternal =
                      subItem.href.startsWith('http://') ||
                      subItem.href.startsWith('https://');
                    return (
                      <MobileNavigationMenuItem
                        key={subItem.title || subItem.key}
                      >
                        <MobileNavigationMenuLink
                          href={subItem.href}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          target={isExternal ? '_blank' : undefined}
                        >
                          {subItem.key ? t(subItem.key) : subItem.title}
                        </MobileNavigationMenuLink>
                      </MobileNavigationMenuItem>
                    );
                  })}
                </ul>
              </CollapsibleContent>
            </MobileNavigationMenuItem>
          </Collapsible>
        ),
      )}
      <li>
        <Separator orientation="horizontal" />
      </li>
      <MobileNavigationMenuItem>
        <Wallet
          className={`${mobileNavigationCollapsibleTriggerStyle()} border-border! w-full! justify-center border! px-4!`}
        />
      </MobileNavigationMenuItem>
    </MobileNavigationMenu>
  );
};
