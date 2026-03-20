'use client';

import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { use, useState } from 'react';

import type { ApiPlan } from '@/data/plans';
import { useLocale } from '@/hooks/use-locale';
import { numberFormat } from '@/lib/format';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Separator } from '@/ui/separator';
import { Switch } from '@/ui/switch';

const faqKeys = [
  'subscribe',
  'payment',
  'upgrade',
  'refund',
  'renewal',
  'activation',
] as const;

const formatCents = (cents: number, decimals = 2) => {
  const value = cents / 100;
  return value % 1 === 0
    ? `$${numberFormat(value)}`
    : `$${numberFormat(value, { maximumFractionDigits: decimals })}`;
};

type Props = {
  plansPromise: Promise<ApiPlan[]>;
};

export const Apis = ({ plansPromise }: Props) => {
  const { t } = useLocale('apis');
  const [isAnnual, setIsAnnual] = useState(true);
  const plans = use(plansPromise);

  return (
    <>
      <div className="mb-20 flex flex-col items-center gap-10 md:flex-row md:items-start">
        <div className="flex-1">
          <p className="text-body-sm text-muted-foreground mb-4 tracking-widest uppercase">
            {t('label')}
          </p>
          <h1 className="text-headline-2xl mb-6 text-balance md:max-w-xl">
            {t('heading')}
          </h1>
          <p className="text-muted-foreground mb-8 text-pretty md:max-w-xl">
            {t('description')}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <a
                href="https://dash.nearblocks.io"
                rel="noopener noreferrer"
                target="_blank"
              >
                {t('dashboard')}
                <ArrowUpRight className="mt-2 -ml-1 size-3 self-start" />
              </a>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a
                href="https://api.nearblocks.io/api-docs"
                rel="noopener noreferrer"
                target="_blank"
              >
                {t('docs')}
                <ArrowUpRight className="mt-2 -ml-1 size-3 self-start" />
              </a>
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <Image
            alt="API Documentation"
            className="mx-auto w-full max-w-lg"
            height={326}
            src="/images/code-block.png"
            width={618}
          />
        </div>
      </div>

      <div className="mb-6 text-center">
        <h2 className="text-headline-2xl mb-3">{t('pricing.heading')}</h2>
        <p className="text-muted-foreground mx-auto mb-8 text-balance">
          {t('pricing.subheading')}
        </p>
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className={isAnnual ? 'text-muted-foreground' : 'font-medium'}>
            {t('pricing.monthly')}
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={isAnnual ? 'font-medium' : 'text-muted-foreground'}>
            {t('pricing.annually')}{' '}
            <span className="text-lime-foreground text-body-sm">
              {t('pricing.save')}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, i) => {
            const isFeatured = plan.id === 4;
            const isFree = i === 2;
            const monthlyDisplay = isFree
              ? '$0'
              : formatCents(plan.price_monthly, 0);
            const annualMonthlyDisplay = isFree
              ? '$0'
              : formatCents(plan.price_annually / 12);
            const annualTotalDisplay = isFree
              ? ''
              : `${formatCents(plan.price_annually)}/yr`;
            const strikethrough = isFree
              ? ''
              : formatCents(plan.price_monthly * 12, 0);
            const currentPrice = isAnnual
              ? annualMonthlyDisplay
              : monthlyDisplay;

            return (
              <Card
                className={`relative flex flex-col p-6 ${
                  isFeatured ? 'border-primary border-2' : ''
                }`}
                key={plan.id}
              >
                {isFeatured && (
                  <span className="bg-primary text-primary-foreground text-body-xs absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 font-medium">
                    {t('pricing.mostUsed')}
                  </span>
                )}
                <p className="text-body-xs mb-4 tracking-widest uppercase">
                  {plan.title}
                </p>
                <div className="mb-1">
                  <span className="text-headline-4xl">{currentPrice}</span>
                  {currentPrice !== '$0' && (
                    <span className="text-muted-foreground text-body-sm">
                      {t('pricing.mo')}
                    </span>
                  )}
                </div>
                {isFree ? (
                  <p className="text-muted-foreground text-body-xs mb-4 h-5">
                    {t('pricing.attribution')}
                  </p>
                ) : isAnnual ? (
                  <p className="text-muted-foreground text-body-xs mb-4 h-5">
                    <span className="text-red-foreground line-through">
                      {strikethrough}
                    </span>{' '}
                    <span className="text-lime-foreground">
                      {annualTotalDisplay}
                    </span>
                  </p>
                ) : (
                  <p className="text-muted-foreground text-body-xs mb-4 h-5">
                    {t('pricing.or')}{' '}
                    <span className="text-lime-foreground">
                      {annualMonthlyDisplay} {t('pricing.off')}
                    </span>{' '}
                    {t('pricing.billed')}
                  </p>
                )}
                <Separator className="mb-4" />
                <ul className="text-body-sm mb-6 flex-1 space-y-2 text-center">
                  <li>
                    {t('pricing.callsPerMinute', {
                      count: numberFormat(plan.limit_per_minute),
                    })}
                  </li>
                  <li>
                    {t('pricing.callsPerDay', {
                      count: numberFormat(plan.limit_per_day),
                    })}
                  </li>
                  <li>
                    {t('pricing.callsPerMonth', {
                      count: numberFormat(plan.limit_per_month),
                    })}
                  </li>
                  <li>
                    {isFree
                      ? t('pricing.personalUse')
                      : t('pricing.commercialUse')}
                  </li>
                </ul>
                <Button asChild className="w-full" variant="secondary">
                  <a
                    href={`https://dash.nearblocks.io/login?id=${plan?.id}&interval=${
                      isAnnual ? 'year' : 'month'
                    }`}
                  >
                    {t('pricing.cta')}
                  </a>
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="border-primary mb-16 border-2 p-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-body-sm text-muted-foreground mb-1">
              {t('enterprise.label')}
            </p>
            <h3 className="text-headline-lg mb-1">{t('enterprise.heading')}</h3>
            <p className="text-muted-foreground text-body-sm text-balance">
              {t('enterprise.description')}
            </p>
          </div>
          <Button asChild>
            <Link href="/contact?subject=2">
              {t('enterprise.cta')} <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </Card>

      <div className="mb-16">
        <h2 className="text-headline-2xl mb-8 text-center">
          {t('faq.heading')}
        </h2>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
          {faqKeys.map((key) => (
            <div key={key}>
              <p className="mb-2 font-medium">{t(`faq.${key}.question`)}</p>
              <p className="text-muted-foreground text-body-sm text-balance">
                {t(`faq.${key}.answer`)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Separator className="mb-10" />
      <div className="mb-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center">
        <p className="text-body-lg">{t('footer.description')}</p>
        <Button asChild size="lg" variant="secondary">
          <a
            href="https://api.nearblocks.io/api-docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('footer.cta')}
            <ArrowUpRight className="mt-2 -ml-1 size-3 self-start" />
          </a>
        </Button>
      </div>
    </>
  );
};
