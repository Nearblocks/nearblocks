import { ArrowRight, BarChart3, Blocks, Code2, Coins } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';

import { Link } from '@/components/link';
import { hasLocale, translator } from '@/locales/dictionaries';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Separator } from '@/ui/separator';

export const generateMetadata = async ({
  params,
}: PageProps<'/[lang]/about'>): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'about');

  return {
    alternates: { canonical: '/about' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const features = [
  {
    description:
      'Search across every block, transaction, account, and contract on NEAR mainnet and testnet.',
    icon: Blocks,
    title: 'Blockchain Explorer',
  },
  {
    description:
      'Track fungible tokens, NFTs, multi-tokens, and cross-chain activity all in one place.',
    icon: Coins,
    title: 'Token Tracking',
  },
  {
    description:
      'Real-time data feeds for prices, gas, validators, and historical aggregates.',
    icon: BarChart3,
    title: 'Analytics & Charts',
  },
  {
    description:
      'REST APIs with generous free tier and commercial plans for production workloads.',
    icon: Code2,
    title: 'Developer APIs',
  },
];

const AboutPage = async ({ params }: PageProps<'/[lang]/about'>) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'about');

  return (
    <main className="flex flex-1 flex-col">
      <section className="container mx-auto flex flex-col items-center gap-10 px-4 py-16 md:flex-row md:py-24">
        <div className="flex-1">
          <p className="text-body-sm text-muted-foreground mb-4 tracking-widest uppercase">
            About us
          </p>
          <h1 className="text-headline-3xl mb-6 font-normal text-balance">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mb-8 max-w-xl text-pretty">
            {t('description')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/">
                Explore the chain
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/apis">
                Developer APIs
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <Image
            alt="NearBlocks community across the world"
            className="mx-auto w-full max-w-lg"
            height={348}
            priority
            src="/images/world-link.png"
            width={618}
          />
        </div>
      </section>

      <Separator />

      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 max-w-2xl text-center md:mx-auto">
          <h2 className="text-headline-2xl mb-3 font-normal">What we offer</h2>
          <p className="text-muted-foreground text-pretty">
            The complete data toolkit for the NEAR ecosystem — from raw chain
            data to polished analytics.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ description, icon: Icon, title }) => (
            <Card className="p-6" key={title}>
              <div className="bg-muted mb-4 inline-flex rounded-lg p-3">
                <Icon className="text-primary size-5" />
              </div>
              <h3 className="text-headline-base mb-2 font-medium">{title}</h3>
              <p className="text-muted-foreground text-body-sm text-pretty">
                {description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-headline-2xl mb-4 font-normal">Our mission</h2>
          <p className="text-muted-foreground text-pretty">
            Built and launched in 2022, NearBlocks is one of the earliest
            projects built around the NEAR Protocol and its community — with the
            mission of providing equitable, transparent access to blockchain
            data for everyone, from individual developers to enterprise teams.
          </p>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
