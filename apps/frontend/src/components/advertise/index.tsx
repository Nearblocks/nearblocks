'use client';

import { CircleCheck } from 'lucide-react';
import Image from 'next/image';

import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Separator } from '@/ui/separator';

export const Advertise = () => {
  const theme = useTheme();

  return (
    <>
      <div className="mb-20 flex flex-col items-center gap-10 md:flex-row md:items-start">
        <div className="flex-1 text-balance">
          <p className="text-body-sm text-muted-foreground mb-4 tracking-widest uppercase">
            ADVERTISE ON NEARBLOCKS
          </p>
          <h1 className="text-headline-2xl mb-6">
            Reach millions of Blockchain Enthusiasts and Developers Worldwide
          </h1>
          <p className="text-muted-foreground mb-4">
            Nearblocks is the leading Block Explorer, Search, API and Analytics
            Platform for the NEAR Blockchain.
          </p>
          <p className="text-muted-foreground mb-8">
            Our website offers wide exposure to the Near Protocol and block
            chain community. Advertising with us makes it easier for users to
            discover your project through sponsored content on our web pages.
          </p>
          <Button asChild size="lg" variant="secondary">
            <a href="https://dash.nearblocks.io/login">Get started now</a>
          </Button>
        </div>
        <div className="flex-1">
          <Image
            alt="Reach millions worldwide"
            className="mx-auto w-full max-w-lg"
            height={348}
            src="/images/world_link.png"
            width={618}
          />
        </div>
      </div>
      <Card className="mb-20 px-3 py-3">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <div className="flex flex-col items-center py-4 text-center">
            <p className="text-headline-2xl">#1</p>
            <p className="text-body-xs text-muted-foreground mt-1 uppercase">
              NEAR Block Explorer
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
              Page Views Per Month
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
              Unique Visitors per Month
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
              Registered Users
            </p>
          </div>
        </div>
      </Card>
      <Card className="border-0 px-4 py-10">
        <h2 className="text-headline-2xl mb-4 text-center">
          Advertisement Types
        </h2>
        <p className="text-muted-foreground mx-auto mb-20 max-w-2xl text-center">
          Get your message in front of millions blockchain enthusiasts. Our
          sponsored contents are designed to be cohesive with the site&apos;s
          user experience.
        </p>
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <h3 className="text-headline-lg mb-3">Banner Ad Sponsorship</h3>
              <p className="text-muted-foreground mb-5">
                Prominently create brand awareness and user retention with
                banner ads on Nearblocks pages. Creatively promote, engage user
                and increase &quot;eyeball&quot; reach.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>Graphical</span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>Eyeball Catching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>Brand Awareness</span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <Image
                alt="Banner Ad Sponsorship"
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
                Header Text Ad Sponsorship
              </h3>
              <p className="text-muted-foreground mb-5">
                Reach users by reaching to them individually with targeted copy.
                Your sponsored ad text displays in a non-intrusive and clean
                manner on the top of Nearblocks pages.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>Clear Message</span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>Non-Intrusive</span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>High Coverage</span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <Image
                alt="Header Text Ad Sponsorship"
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
              <h3 className="text-headline-lg mb-3">Search Ad Sponsorship</h3>
              <p className="text-muted-foreground mb-5">
                Increase brand awareness and user retention with ads on the
                Search Bar. Promote creatively, engage users and increase
                &quot;eyeball&quot; reach.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>Clear Message</span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>Non-Intrusive</span>
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck className="text-lime-foreground size-4 shrink-0" />
                  <span>High Coverage</span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <Image
                alt="Search Ad Sponsorship"
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
