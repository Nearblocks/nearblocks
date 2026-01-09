'use client';

import { LuArrowUpRight } from 'react-icons/lu';
import { RiGithubFill, RiTelegram2Line, RiTwitterXLine } from 'react-icons/ri';

import { Link } from '@/components/link';
import { useLocale } from '@/hooks/use-locale';
import { CoinGecko } from '@/icons/coingecko';
import { Logo } from '@/icons/logo';
import { Separator } from '@/ui/separator';

export const Footer = () => {
  const { t } = useLocale('layout');

  return (
    <footer className="bg-card text-body-xs">
      <div className="container mx-auto px-4">
        <div className="flex flex-col flex-wrap justify-between gap-6 py-6 md:flex-row lg:grid lg:grid-cols-[3fr_1fr_1fr_1fr]">
          <div className="flex basis-1/1 flex-col gap-4">
            <Link href="/">
              <Logo className="text-primary h-7.5" />
            </Link>
            <p className="max-w-85">{t('footer.description')}</p>
            <div className="flex gap-2">
              <Link
                className="border-border flex size-6 items-center justify-center rounded-full border"
                href="https://x.com/nearblocks"
                rel="noreferrer nofollow noopener"
                target="_blank"
                title="Twitter"
              >
                <RiTwitterXLine className="text-primary size-4" />
              </Link>
              <Link
                className="border-border flex size-6 items-center justify-center rounded-full border"
                href="https://github.com/Nearblocks"
                rel="noreferrer nofollow noopener"
                target="_blank"
                title="GitHub"
              >
                <RiGithubFill className="text-primary size-4" />
              </Link>
              <Link
                className="border-border flex size-6 items-center justify-center rounded-full border"
                href="https://t.me/nearblocks"
                rel="noreferrer nofollow noopener"
                target="_blank"
                title="Telegram"
              >
                <RiTelegram2Line className="text-primary size-4" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-headline-sm text-primary pb-3">
              {t('footer.menu.tools.title')}
            </h3>
            <ul className="space-y-1">
              <li>
                <Link href="/advertise">
                  {t('footer.menu.tools.advertise')}
                </Link>
              </li>
              <li>
                <Link href="/apis">{t('footer.menu.tools.apis')}</Link>
              </li>
              <li>
                <Link
                  className="flex gap-1"
                  href="https://nearvalidate.org/"
                  rel="noreferrer nofollow noopener"
                  target="_blank"
                >
                  {t('footer.menu.tools.nearValidate')}{' '}
                  <LuArrowUpRight className="size-3" />
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-headline-sm text-primary pb-3">
              {t('footer.menu.explore.title')}
            </h3>
            <ul className="space-y-1">
              <li>
                <Link href="/blocks">{t('footer.menu.explore.blocks')}</Link>
              </li>
              <li>
                <Link href="/txns">
                  {t('footer.menu.explore.transactions')}
                </Link>
              </li>
              <li>
                <Link href="/charts">{t('footer.menu.explore.charts')}</Link>
              </li>
              <li>
                <Link href="/nodes">{t('footer.menu.explore.nodes')}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-headline-sm text-primary pb-3">
              {t('footer.menu.company.title')}
            </h3>
            <ul className="space-y-1">
              <li>
                <Link href="/about">{t('footer.menu.company.about')}</Link>
              </li>
              <li>
                <Link href="/contact">{t('footer.menu.company.contact')}</Link>
              </li>
              <li>
                <Link href="/terms-and-conditions">
                  {t('footer.menu.company.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy">
                  {t('footer.menu.company.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  className="flex gap-1"
                  href="https://status.nearblocks.io/"
                  rel="noreferrer nofollow noopener"
                  target="_blank"
                >
                  {t('footer.menu.company.status')}{' '}
                  <LuArrowUpRight className="size-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Separator />
        <div className="space-y-1 py-6">
          <p className="text-body-xs text-primary">
            {t('footer.copyright')} {new Date().getFullYear()}
          </p>
          <p className="text-body-xs text-muted-foreground flex items-center gap-2">
            {t('footer.disclaimer')}{' '}
            <Link href="https://www.coingecko.com/" target="_blank">
              <CoinGecko className="size-5" />
            </Link>
          </p>
          <p className="text-body-xs text-muted-foreground">
            {t('footer.trademark')}
          </p>
        </div>
      </div>
    </footer>
  );
};
