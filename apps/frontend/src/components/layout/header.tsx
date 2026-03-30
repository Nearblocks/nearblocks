'use client';

import { Menu as LuMenu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { Link } from '@/components/link';
import { useLocale } from '@/hooks/use-locale';
import { Logo } from '@/icons/logo';
import { hrefForLocale } from '@/lib/locale';
import type { Locale } from '@/locales/config';
import { NavMenu, RouteKey } from '@/types/types';
import { Button } from '@/ui/button';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/popover';

import { Menu } from './menu';
import { MobileMenu } from './mobile-menu';
import { NetworkSwitcher } from './network';
import { ThemeToggle } from './theme';

const languageChoices: { locale: Locale; title: string }[] = [
  { locale: 'en', title: 'English' },
  { locale: 'es', title: 'Español' },
  { locale: 'fil-ph', title: 'Filipino' },
  { locale: 'fr', title: 'Français' },
  { locale: 'id', title: 'Bahasa' },
  { locale: 'it', title: 'Italiano' },
  { locale: 'ja', title: '日本語' },
  { locale: 'ko', title: '한국어' },
  { locale: 'ru', title: 'Русский' },
  { locale: 'th', title: 'ภาษาไทย' },
  { locale: 'uk', title: 'Українська' },
  { locale: 'vi', title: 'Tiếng Việt' },
  { locale: 'zh-cn', title: '汉语 (Simplified)' },
  { locale: 'zh-hk', title: '漢語 (Traditional)' },
];

const staticMenu: NavMenu<RouteKey<'layout'>> = [
  { href: '/', key: 'menu.home.title' },
  {
    key: 'menu.blockchain.title',
    menu: [
      { href: '/blocks', key: 'menu.blockchain.blocks' },
      { href: '/txns', key: 'menu.blockchain.txns' },
      { href: '/multichain-txns', key: 'menu.blockchain.multichain' },
      { href: '/charts', key: 'menu.blockchain.charts' },
      { href: '/validators', key: 'menu.blockchain.nodes' },
    ],
  },
  {
    key: 'menu.tokens.title',
    menu: [
      { href: '/tokens', key: 'menu.tokens.topTokens' },
      { href: '/tokens/transfers', key: 'menu.tokens.tokenTransfers' },
      { href: '/nft-tokens', key: 'menu.tokens.topNFTs' },
      { href: '/nft-tokens/transfers', key: 'menu.tokens.nftTransfers' },
    ],
  },
];

const useHeaderMenu = (): NavMenu<RouteKey<'layout'>> => {
  const pathname = usePathname() ?? '/';

  return useMemo(() => {
    const languageMenu = languageChoices.map(({ locale, title }) => ({
      href: hrefForLocale(pathname, locale),
      title,
    }));

    return [...staticMenu, { key: 'menu.languages.title', menu: languageMenu }];
  }, [pathname]);
};

export const Header = () => {
  const { t } = useLocale('layout');
  const menu = useHeaderMenu();

  return (
    <header className="bg-card">
      <Popover>
        <PopoverAnchor>
          <div className="container mx-auto flex h-15 items-center px-4">
            <Link href="/">
              <Logo className="text-primary h-10" />
            </Link>
            <div className="text-headline-sm ml-auto flex gap-2">
              <Menu menu={menu} />
              <div className="flex items-center gap-2 lg:hidden">
                <NetworkSwitcher />
                <ThemeToggle />
                <PopoverTrigger asChild>
                  <Button
                    className="group relative"
                    size="icon-xs"
                    title={t('header.toggleMenu')}
                    variant="secondary"
                  >
                    <LuMenu className="scale-100 rotate-0 transition-all group-data-[state=open]:scale-0 group-data-[state=open]:-rotate-90" />
                    <X className="absolute scale-0 rotate-90 transition-all group-data-[state=open]:scale-100 group-data-[state=open]:rotate-0" />
                    <span className="sr-only">{t('header.toggleMenu')}</span>
                  </Button>
                </PopoverTrigger>
              </div>
            </div>
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="center"
          autoFocus={false}
          className="w-(--radix-popper-available-width) rounded-t-none"
          onOpenAutoFocus={(event) => event.preventDefault()}
          side="bottom"
          sideOffset={0}
        >
          <div className="container mx-auto px-4">
            <MobileMenu menu={menu} />
          </div>
        </PopoverContent>
      </Popover>
    </header>
  );
};
