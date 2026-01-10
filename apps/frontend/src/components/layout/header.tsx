'use client';

import { LuMenu, LuX } from 'react-icons/lu';

import { Link } from '@/components/link';
import { useLocale } from '@/hooks/use-locale';
import { Logo } from '@/icons/logo';
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

const menu: NavMenu<RouteKey<'layout'>> = [
  { href: '/', key: 'menu.home.title' },
  {
    key: 'menu.blockchain.title',
    menu: [
      { href: '/blocks', key: 'menu.blockchain.blocks' },
      { href: '/txns', key: 'menu.blockchain.txns' },
      { href: '/charts', key: 'menu.blockchain.charts' },
      { href: '/nodes', key: 'menu.blockchain.nodes' },
    ],
  },
  {
    key: 'menu.tokens.title',
    menu: [
      { href: '/tokens', key: 'menu.tokens.topTokens' },
      { href: '/tokentxns', key: 'menu.tokens.tokenTransfers' },
      { href: '/nft-tokens', key: 'menu.tokens.topNFTs' },
      { href: '/nft-tokentxns', key: 'menu.tokens.nftTransfers' },
    ],
  },
  {
    key: 'menu.languages.title',
    menu: [
      { href: '/en', title: 'English' },
      { href: '/es', title: 'Español' },
      { href: '/fil-ph', title: 'Filipino' },
      { href: '/fr', title: 'Français' },
      { href: '/id', title: 'Bahasa' },
      { href: '/it', title: 'Italiano' },
      { href: '/ja', title: '日本語' },
      { href: '/ko', title: '한국어' },
      { href: '/ru', title: 'Русский' },
      { href: '/th', title: 'ภาษาไทย' },
      { href: '/uk', title: 'Українська' },
      { href: '/vi', title: 'Tiếng Việt' },
      { href: '/zh-cn', title: '汉语 (Simplified)' },
      { href: '/zh-hk', title: '漢語 (Traditional)' },
    ],
  },
];

export const Header = () => {
  const { t } = useLocale('layout');

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
                    <LuX className="absolute scale-0 rotate-90 transition-all group-data-[state=open]:scale-100 group-data-[state=open]:rotate-0" />
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
