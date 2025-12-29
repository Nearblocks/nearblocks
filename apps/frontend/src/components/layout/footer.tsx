import { LuArrowUpRight } from 'react-icons/lu';
import { RiGithubFill, RiTelegram2Line, RiTwitterXLine } from 'react-icons/ri';

import { Link } from '@/components/link';
import { CoinGecko } from '@/icons/coingecko';
import { Logo } from '@/icons/logo';
import { Separator } from '@/ui/separator';

export const Footer = () => {
  return (
    <footer className="bg-card text-body-xs">
      <div className="container mx-auto px-4">
        <div className="flex flex-col flex-wrap justify-between gap-6 py-6 md:flex-row lg:grid lg:grid-cols-[3fr_1fr_1fr_1fr]">
          <div className="flex basis-1/1 flex-col gap-4">
            <Link href="/">
              <Logo className="text-primary h-7.5" />
            </Link>
            <p className="max-w-85">
              NEAR Blocks is the leading blockchain explorer dedicated to the
              NEAR ecosystem. Powered by NEAR Protocol.
            </p>
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
            <h3 className="text-headline-sm text-primary pb-3">Tools</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/advertise">Advertise</Link>
              </li>
              <li>
                <Link href="/apis">NEAR Indexer APIs</Link>
              </li>
              <li>
                <Link
                  className="flex gap-1"
                  href="https://nearvalidate.org/"
                  rel="noreferrer nofollow noopener"
                  target="_blank"
                >
                  NEAR Validate <LuArrowUpRight className="size-3" />
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-headline-sm text-primary pb-3">Explore</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/blocks">Latest Blocks</Link>
              </li>
              <li>
                <Link href="/txns">Latest Transactions</Link>
              </li>
              <li>
                <Link href="/charts">Charts & Stats</Link>
              </li>
              <li>
                <Link href="/nodes">Node Explorer</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-headline-sm text-primary pb-3">Company</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/terms-and-conditions">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link
                  className="flex gap-1"
                  href="https://status.nearblocks.io/"
                  rel="noreferrer nofollow noopener"
                  target="_blank"
                >
                  Status <LuArrowUpRight className="size-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Separator />
        <div className="space-y-1 py-6">
          <p className="text-body-xs text-primary">
            NearBlocks © {new Date().getFullYear()}
          </p>
          <p className="text-body-xs text-muted-foreground flex items-center gap-2">
            Price feeds aggregated by{' '}
            <Link href="https://www.coingecko.com/" target="_blank">
              <CoinGecko className="size-5" />
            </Link>
          </p>
          <p className="text-body-xs text-muted-foreground">
            NearBlocks is operated full and on its own. NearBlocks is not
            associated to The NEAR Foundation and every licensed trademark
            displayed on this website belongs to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};
