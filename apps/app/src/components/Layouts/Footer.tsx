import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import Image from 'next/legacy/image';

import { Link } from '@/i18n/routing';

import Arrow from '../Icons/Arrow';
const Footer = () => {
  const t = useTranslations();
  const { theme } = useTheme();
  const currentDate = new Date();
  return (
    <footer className="footer dark:bg-black-600  ">
      <div className="bg-bottom-right">
        <div className="bg-bottom-left">
          <div className="container mx-auto px-3 pb-32">
            <div className="grid grid-cols-1 lg:!grid-cols-6 gap-5 py-5">
              <div className="w-64">
                <div className="text-sm text-grey-dark flex flex-col py-3">
                  <Image
                    alt="NearBlocks"
                    className="block"
                    height="40"
                    layout="fixed"
                    src={
                      theme === 'dark'
                        ? '/images/nearblocksblack_dark.svg'
                        : '/images/nearblocksblack.svg'
                    }
                    width="174"
                  />
                </div>
                <p className="max-w-xs text-black text-xs leading-6 pb-3 dark:text-gray-200">
                  {t('footer.description')}
                </p>
                <div>
                  <a
                    href="https://twitter.com/nearblocks"
                    rel="noreferrer nofollow noopener"
                    target="_blank"
                  >
                    <Image
                      alt="Twitter"
                      height={24}
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
                <div className="text-green-500 dark:text-green-250 font-semibold text-xl mb-3">
                  &nbsp;
                </div>
                <ul className="text-black opacity-80 footer-links text-sm leading-6 dark:text-gray-200">
                  <li>
                    <Link href="/">&nbsp;</Link>
                  </li>
                </ul>
              </div>
              <div className="">
                <div className="text-green-500 dark:text-green-250 font-semibold text-xl mb-3">
                  Tools
                </div>
                <ul className="text-black opacity-80 footer-links text-sm leading-6 dark:text-gray-200">
                  <li>
                    <Link href="/advertise" legacyBehavior>
                      <a>{t('footer.links.advertise')}</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/apis" legacyBehavior>
                      <a>{t('footer.links.api')}</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="https://lite.nearblocks.io/" legacyBehavior>
                      <a className="flex">
                        NEAR Validate
                        <span>
                          <Arrow className="-rotate-45 -mt-1 h-4 w-4" />
                        </span>
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="">
                <div className="text-green-500 dark:text-green-250 font-semibold text-xl mb-3">
                  {t('footer.links.explore')}
                </div>
                <ul className="text-black opacity-80 footer-links text-sm leading-6 dark:text-gray-200 ">
                  <li>
                    <Link href="/blocks" legacyBehavior>
                      <a>{t('footer.links.latestBlocks')}</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/txns" legacyBehavior>
                      <a>{t('footer.links.latestTxns')}</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/charts" legacyBehavior>
                      <a>{t('footer.links.charts')}</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/node-explorer" legacyBehavior>
                      <a>{t('footer.links.nearValidator')}</a>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="">
                <div className="text-green-500 dark:text-green-250 font-semibold text-xl mb-3">
                  {t('footer.links.company')}
                </div>
                <ul className="text-black opacity-80 footer-links text-sm leading-6 dark:text-gray-200">
                  <li>
                    <Link href="/about" legacyBehavior>
                      <a>{t('footer.links.about')}</a>
                    </Link>
                  </li>

                  <li>
                    <Link href="/contact" legacyBehavior>
                      <a>{t('footer.links.contact')}</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms-and-conditions" legacyBehavior>
                      <a>{t('footer.links.terms')}</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="https://status.nearblocks.io/" legacyBehavior>
                      <a
                        className="flex"
                        rel="noreferrer nofollow noopener"
                        target="_blank"
                      >
                        Status
                      </a>
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
                href="http://coingecko.com?utm_campaign=partnership&utm_source=nearblocks&utm_medium=referral"
                legacyBehavior
              >
                <a
                  className="mx-1  flex items-center"
                  rel="noreferrer nofollow noopener"
                  target="_blank"
                >
                  <Image
                    alt="CoinGecko"
                    className="inline-flex w-5 h-5"
                    height={20}
                    src="/images/coingecko_logo_black.svg"
                    width={20}
                  />
                </a>
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
