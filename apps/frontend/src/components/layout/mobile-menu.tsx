'use client';

import { Check, ChevronRight, Moon, Sun } from 'lucide-react';

import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { applyTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { Theme } from '@/types/enums';
import { isNavMenuDivider, NavMenu, RouteKey } from '@/types/types';
import { Collapsible, CollapsibleContent } from '@/ui/collapsible';
import {
  mobileNavigationCollapsibleTriggerStyle,
  mobileNavigationLinkStyle,
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
  const theme = useTheme();
  const network = useConfig((c) => c.config.network);
  const mainnetUrl = useConfig((c) => c.config.mainnetUrl);
  const testnetUrl = useConfig((c) => c.config.testnetUrl);
  const onTheme = (value: Theme) => applyTheme(value);

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
      <Collapsible asChild>
        <MobileNavigationMenuItem>
          <MobileNavigationMenuCollapsibleTrigger>
            <span>{t('header.switchNetwork')}</span>
            <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
          </MobileNavigationMenuCollapsibleTrigger>
          <CollapsibleContent>
            <ul className="border-border my-2 ml-4 border-l pl-2">
              <MobileNavigationMenuItem>
                <a
                  className={cn(mobileNavigationLinkStyle(), 'justify-between')}
                  href={mainnetUrl}
                  rel="noopener noreferrer"
                >
                  Mainnet
                  {network === 'mainnet' && <Check className="size-4" />}
                </a>
              </MobileNavigationMenuItem>
              <MobileNavigationMenuItem>
                <a
                  className={cn(mobileNavigationLinkStyle(), 'justify-between')}
                  href={testnetUrl}
                  rel="noopener noreferrer"
                >
                  Testnet
                  {network === 'testnet' && <Check className="size-4" />}
                </a>
              </MobileNavigationMenuItem>
            </ul>
          </CollapsibleContent>
        </MobileNavigationMenuItem>
      </Collapsible>
      <Collapsible asChild>
        <MobileNavigationMenuItem>
          <MobileNavigationMenuCollapsibleTrigger>
            <span>{t('header.toggleTheme')}</span>
            <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
          </MobileNavigationMenuCollapsibleTrigger>
          <CollapsibleContent>
            <ul className="border-border my-2 ml-4 border-l pl-2">
              <MobileNavigationMenuItem>
                <button
                  className={cn(
                    mobileNavigationLinkStyle(),
                    'w-full justify-between',
                  )}
                  onClick={() => onTheme('light')}
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <Sun className="size-4" />
                    Light
                  </span>
                  {theme === 'light' && <Check className="size-4" />}
                </button>
              </MobileNavigationMenuItem>
              <MobileNavigationMenuItem>
                <button
                  className={cn(
                    mobileNavigationLinkStyle(),
                    'w-full justify-between',
                  )}
                  onClick={() => onTheme('dark')}
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <Moon className="size-4" />
                    Dark
                  </span>
                  {theme === 'dark' && <Check className="size-4" />}
                </button>
              </MobileNavigationMenuItem>
            </ul>
          </CollapsibleContent>
        </MobileNavigationMenuItem>
      </Collapsible>
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
