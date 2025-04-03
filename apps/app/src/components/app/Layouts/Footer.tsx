'use client';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import Image from 'next/image';

import { Link } from '@/i18n/routing';

import Arrow from '../Icons/Arrow';

const Footer = ({ theme: cookieTheme }: { theme: string }) => {
  const currentDate = new Date();
  let { theme } = useTheme();
  const t = useTranslations();

  if (theme == undefined) {
    theme = cookieTheme;
  }

  return (
    <footer className="footer dark:bg-black-600  ">
      <div className="bg-bottom-right">
        <div className="bg-bottom-left">
          <div className="container-xxl mx-auto px-5 pb-24">
            <div className="grid grid-cols-1 lg:!grid-cols-6 gap-5 py-5">
              <div className="w-72 sm:w-96">
                <div className="text-sm text-grey-dark flex flex-col py-3">
                  <Image
                    alt="NearBlocks"
                    className="block"
                    height="40"
                    layout="fixed"
                    loading="eager"
                    src={
                      theme === 'dark'
                        ? '/images/nearblocksblack_dark.svg'
                        : '/images/nearblocksblack.svg'
                    }
                    width="174"
                  />
                </div>
                <p className="max-w-xs text-nearblue-600 text-xs leading-6 pb-3 dark:text-neargray-10 font-medium">
                  {t('footer.description')}
                </p>

                <div className="flex">
                  <a
                    href="https://twitter.com/nearblocks"
                    rel="noreferrer nofollow noopener"
                    target="_blank"
                  >
                    <Image
                      alt="Twitter"
                      height={24}
                      loading="eager"
                      src={
                        theme === 'dark'
                          ? '/images/twitter_icon_black.svg'
                          : '/images/twitter_icon.svg'
                      }
                      width={24}
                    />
                  </a>
                  <a
                    className="ml-2"
                    href="https://github.com/Nearblocks"
                    rel="noreferrer nofollow noopener"
                    target="_blank"
                  >
                    <Image
                      alt="Github"
                      height={24}
                      loading="eager"
                      src={
                        theme === 'dark'
                          ? '/images/github_icon_black.svg'
                          : '/images/github_icon.svg'
                      }
                      width={24}
                    />
                  </a>
                  <a
                    className="ml-2"
                    href="https://t.me/nearblocks"
                    rel="noreferrer nofollow noopener"
                    target="_blank"
                  >
                    <Image
                      alt="Telegram"
                      height={24}
                      loading="eager"
                      src={
                        theme === 'dark'
                          ? '/images/telegram_black.svg'
                          : '/images/nearblocks-telegram.svg'
                      }
                      width={24}
                    />
                  </a>
                </div>
              </div>
              <div className="hidden lg:!block"></div>
              <div className="hidden lg:!block">
                <div className="text-green-500 dark:text-green-250 font-medium text-xs mb-3">
                  &nbsp;
                </div>
                <ul className="text-nearblue-600 opacity-80 footer-links text-[13px] font-medium leading-6 dark:text-neargray-10">
                  <li>
                    <Link href="/">&nbsp;</Link>
                  </li>
                </ul>
              </div>
              <div className="">
                <div className="text-green-500 dark:text-green-250 font-semibold text-base mb-3">
                  Tools
                </div>
                <ul className="text-nearblue-600 opacity-80 footer-links text-[13px] font-medium leading-6 dark:text-neargray-10">
                  <li>
                    <Link href="/advertise">{t('footer.links.advertise')}</Link>
                  </li>
                  <li>
                    <Link href="/apis">{t('footer.links.api')}</Link>
                  </li>
                  <li>
                    <Link href="https://nearvalidate.org/">
                      <span className="flex">
                        NEAR Validate
                        <span>
                          <Arrow className="-rotate-45 -mt-1 h-4 w-4" />
                        </span>
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="">
                <div className="text-green-500 dark:text-green-250 font-semibold text-base mb-3">
                  {t('footer.links.explore')}
                </div>
                <ul className="text-nearblue-600 opacity-80 footer-links text-[13px] font-medium leading-6 dark:text-neargray-10 ">
                  <li>
                    <Link href="/blocks">{t('footer.links.latestBlocks')}</Link>
                  </li>
                  <li>
                    <Link href="/txns">{t('footer.links.latestTxns')}</Link>
                  </li>
                  <li>
                    <Link href="/charts">{t('footer.links.charts')}</Link>
                  </li>
                  <li>
                    <Link href="/node-explorer">
                      {t('footer.links.nearValidator')}
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="">
                <div className="text-green-500 dark:text-green-250 font-semibold text-base mb-3">
                  {t('footer.links.company')}
                </div>
                <ul className="text-nearblue-600 opacity-80 footer-links text-[13px] font-medium leading-6 dark:text-neargray-10">
                  <li>
                    <Link href="/about">{t('footer.links.about')}</Link>
                  </li>

                  <li>
                    <Link href="/contact">{t('footer.links.contact')}</Link>
                  </li>
                  <li>
                    <Link href="/terms-and-conditions">
                      {t('footer.links.terms')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link
                      className="flex"
                      href="https://status.nearblocks.io/"
                      rel="noreferrer nofollow noopener"
                      target="_blank"
                    >
                      Status
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-black-200">
              <p className="text-green-500 dark:text-green-250 text-xs pb-1 pt-6 text-center ">
                NearBlocks © {currentDate.getFullYear()}
              </p>
            </div>
            <div className="text-gray-400 text-xs flex items-center flex-wrap pb-1">
              Price feeds aggregated by{' '}
              <Link
                className="mx-1  flex items-center"
                href="http://coingecko.com?utm_campaign=partnership&utm_source=nearblocks&utm_medium=referral"
                rel="noreferrer nofollow noopener"
                target="_blank"
              >
                <Image
                  alt="CoinGecko"
                  className="inline-flex w-5 h-5"
                  height={20}
                  loading="eager"
                  src="/images/coingecko_logo_black.svg"
                  width={20}
                />
              </Link>
            </div>
            <div>
              <p className="text-gray-400 text-xs">{t('trademark')}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
