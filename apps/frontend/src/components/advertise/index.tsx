'use client';

import { CircleCheck } from 'lucide-react';
import Image from 'next/image';

import { useLocale } from '@/hooks/use-locale';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Separator } from '@/ui/separator';

export const Advertise = () => {
  const theme = useTheme();
  const { t } = useLocale('advertise');

  return (
    <>
      <div className="mb-20 flex flex-col items-center gap-10 md:flex-row md:items-start">
        <div className="flex-1 text-balance">
          <p className="text-body-sm text-muted-foreground mb-4 tracking-widest uppercase">
            {t('label')}
          </p>
          <h1 className="text-headline-2xl mb-6">{t('title')}</h1>
          <p className="text-muted-foreground mb-4">{t('description')}</p>
          <p className="text-muted-foreground mb-8">{t('body')}</p>
          <Button asChild size="lg" variant="secondary">
            <a href="https://dash.nearblocks.io/login">{t('cta')}</a>
          </Button>
        </div>
        <div className="flex-1">
          <Image
            alt={t('label')}
            className="mx-auto w-full max-w-lg"
            height={348}
            src="/images/world-link.png"
            width={618}
          />
        </div>
      </div>
      <Card className="mb-20 px-3 py-3">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <div className="flex flex-col items-center py-4 text-center">
            <p className="text-headline-2xl">#1</p>
            <p className="text-body-xs text-muted-foreground mt-1 uppercase">
              {t('stats.explorer')}
            </p>
          </div>
          <Separator
            className="hidden sm:mx-auto sm:block lg:mx-4"
            orientation="vertical"
          />
          <Separator className="my-4 sm:hidden" />
          <div className="flex flex-col items-center py-4 text-center">
            <p className="text-headline-2xl">3M</p>
            <p className="text-body-xs text-muted-foreground mt-1 uppercase">
              {t('stats.pageViews')}
            </p>
          </div>
          <Separator
            className="hidden lg:mx-4 lg:block"
            orientation="vertical"
          />
          <Separator className="my-4 sm:col-span-3 lg:hidden" />
          <div className="flex flex-col items-center py-4 text-center">
            <p className="text-headline-2xl">900K</p>
            <p className="text-body-xs text-muted-foreground mt-1 uppercase">
              {t('stats.visitors')}
            </p>
          </div>
          <Separator
            className="hidden sm:mx-4 sm:block"
            orientation="vertical"
          />
          <Separator className="my-4 sm:hidden" />
          <div className="flex flex-col items-center py-4 text-center">
            <p className="text-headline-2xl">150K</p>
            <p className="text-body-xs text-muted-foreground mt-1 uppercase">
              {t('stats.users')}
            </p>
          </div>
        </div>
      </Card>
      <Card className="border-0 px-4 py-10">
        <h2 className="text-headline-2xl mb-4 text-center">
          {t('types.title')}
        </h2>
        <p className="text-muted-foreground mx-auto mb-20 max-w-2xl text-center">
          {t('types.description')}
        </p>
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <h3 className="text-headline-lg mb-3">
                {t('types.banner.title')}
              </h3>
              <p className="text-muted-foreground mb-5">
                {t('types.banner.description')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>{t('types.banner.graphical')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>{t('types.banner.eyeball')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>{t('types.banner.brand')}</span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <Image
                alt={t('types.banner.title')}
                className="bg-muted w-full rounded-lg object-contain"
                height={380}
                src={
                  theme === 'dark'
                    ? '/images/banner-ads-dark.jpg'
                    : '/images/banner-ads-light.jpg'
                }
                width={600}
              />
            </div>
          </div>
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <h3 className="text-headline-lg mb-3">
                {t('types.header.title')}
              </h3>
              <p className="text-muted-foreground mb-5">
                {t('types.header.description')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>{t('types.header.clearMessage')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>{t('types.header.nonIntrusive')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>{t('types.header.highCoverage')}</span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <Image
                alt={t('types.header.title')}
                className="bg-muted w-full rounded-lg object-contain"
                height={380}
                src={
                  theme === 'dark'
                    ? '/images/text-ads-dark.jpg'
                    : '/images/text-ads-light.jpg'
                }
                width={600}
              />
            </div>
          </div>
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <h3 className="text-headline-lg mb-3">
                {t('types.search.title')}
              </h3>
              <p className="text-muted-foreground mb-5">
                {t('types.search.description')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>{t('types.search.clearMessage')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>{t('types.search.nonIntrusive')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>{t('types.search.highCoverage')}</span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <Image
                alt={t('types.search.title')}
                className="bg-muted w-full rounded-lg object-contain"
                height={380}
                src={
                  theme === 'dark'
                    ? '/images/search-ads-dark.jpg'
                    : '/images/search-ads-light.jpg'
                }
                width={600}
              />
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};
