'use client';

import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { use, useState } from 'react';

import type { ApiPlan } from '@/data/plans';
import { numberFormat } from '@/lib/format';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Separator } from '@/ui/separator';
import { Switch } from '@/ui/switch';

const faqs = [
  {
    answer: 'Kindly visit the API self-checkout section above',
    question: 'How do I Subscribe to NearBlocks API services?',
  },
  {
    answer: 'We accept VISA and Mastercard credit card payments, via Stripe.',
    question: 'What are the Payment Options available?',
  },
  {
    answer:
      'API Account upgrades and cancellations can be done through your API user dashboard. Head to the \u201cCurrent plan\u201d section in your dashboard for more details.',
    question: 'How do I Upgrade or Cancel an account?',
  },
  {
    answer:
      'Payments made are non-refundable and we do not provide refunds or credits for any services already paid for.',
    question: 'What is your refund policy?',
  },
  {
    answer:
      'Renewals are automatic, you will receive an email notification coming up to your renewal date.',
    question: 'How does Renewal work?',
  },
  {
    answer:
      'API Account activations are instant once the plan payment is made. To setup an API key after the subscription payment is made, head to API keys.',
    question: 'When will Account Activation occur?',
  },
];

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
  const [isAnnual, setIsAnnual] = useState(true);
  const plans = use(plansPromise);

  return (
    <>
      <div className="mb-20 flex flex-col items-center gap-10 md:flex-row md:items-start">
        <div className="flex-1">
          <p className="text-body-sm text-muted-foreground mb-4 tracking-widest uppercase">
            NEARBLOCKS API
          </p>
          <h1 className="text-headline-2xl mb-6 text-balance md:max-w-xl">
            Build Precise &amp; Reliable Apps with NearBlocks APIs
          </h1>
          <p className="text-muted-foreground mb-8 text-pretty md:max-w-xl">
            Data from the leading Near Protocol Block Explorer catered to your
            project&apos;s needs.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <a
                href="https://dash.nearblocks.io"
                rel="noopener noreferrer"
                target="_blank"
              >
                User Dashboard
                <ArrowUpRight className="mt-2 -ml-1 size-3 self-start" />
              </a>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a
                href="https://api.nearblocks.io/api-docs"
                rel="noopener noreferrer"
                target="_blank"
              >
                API Documentation
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
        <h2 className="text-headline-2xl mb-3">Ready to get started?</h2>
        <p className="text-muted-foreground mx-auto mb-8 text-balance">
          Choose a plan that&apos;s right for you.
        </p>
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className={isAnnual ? 'text-muted-foreground' : 'font-medium'}>
            Monthly
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={isAnnual ? 'font-medium' : 'text-muted-foreground'}>
            Annually{' '}
            <span className="text-lime-foreground text-body-sm">
              (Save 15%)
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
                    Most used!
                  </span>
                )}
                <p className="text-body-xs mb-4 tracking-widest uppercase">
                  {plan.title}
                </p>
                <div className="mb-1">
                  <span className="text-headline-4xl">{currentPrice}</span>
                  {currentPrice !== '$0' && (
                    <span className="text-muted-foreground text-body-sm">
                      /mo
                    </span>
                  )}
                </div>
                {isFree ? (
                  <p className="text-muted-foreground text-body-xs mb-4 h-5">
                    * Attribution required
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
                    Or{' '}
                    <span className="text-lime-foreground">
                      {annualMonthlyDisplay} (15% off)
                    </span>{' '}
                    when billed yearly
                  </p>
                )}
                <Separator className="mb-4" />
                <ul className="text-body-sm mb-6 flex-1 space-y-2 text-center">
                  <li>
                    {numberFormat(plan.limit_per_minute)} calls/minute limit
                  </li>
                  <li>
                    Up to {numberFormat(plan.limit_per_day)} API calls a day
                  </li>
                  <li>
                    Up to {numberFormat(plan.limit_per_month)} API calls a month
                  </li>
                  <li>{isFree ? 'Personal Use' : 'Commercial Use'}</li>
                </ul>
                <Button asChild className="w-full" variant="secondary">
                  <a
                    href={`https://dash.nearblocks.io/login?id=${plan?.id}&interval=${
                      isAnnual ? 'year' : 'month'
                    }`}
                  >
                    Get started now
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
              Enterprise
            </p>
            <h3 className="text-headline-lg mb-1">Dedicated Plan</h3>
            <p className="text-muted-foreground text-body-sm text-balance">
              Greater rate limit with SLA support. Suitable for Enterprise user
              that uses large scale of Nearblocks data.
            </p>
          </div>
          <Button asChild>
            <Link href="/contact?subject=2">
              Contact Us <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </Card>

      <div className="mb-16">
        <h2 className="text-headline-2xl mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <p className="mb-2 font-medium">{faq.question}</p>
              <p className="text-muted-foreground text-body-sm text-balance">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Separator className="mb-10" />
      <div className="mb-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center">
        <p className="text-body-lg">Detailed documentation to get started.</p>
        <Button asChild size="lg" variant="secondary">
          <a
            href="https://api.nearblocks.io/api-docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            View API Documentation
            <ArrowUpRight className="mt-2 -ml-1 size-3 self-start" />
          </a>
        </Button>
      </div>
    </>
  );
};
