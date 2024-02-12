import Link from 'next/link';
import Image from 'next/legacy/image';
import useTranslation from 'next-translate/useTranslation';

import Arrow from '../Icons/Arrow';

const Footer = () => {
  const { t } = useTranslation('common');
  const currentDate = new Date();
  return (
    <footer className="footer">
      <div className="bg-bottom-right">
        <div className="bg-bottom-left">
          <div className="container mx-auto px-3 pb-32">
            <div className="grid grid-cols-1 lg:!grid-cols-6 gap-5 py-5">
              <div className="w-64">
                <div className="text-sm text-grey-dark flex flex-col py-3">
                  <Image
                    src="/images/nearblocksblack.svg"
                    className="block py-3 mr-2"
                    width="234"
                    height="54"
                    alt="NearBlocks"
                    layout="fixed"
                  />
                </div>
                <p className="max-w-xs text-black text-xs leading-6 pb-6">
                  {t('footer.description')}
                </p>
                <div>
                  <a
                    href="https://twitter.com/nearblocks"
                    target="_blank"
                    rel="noreferrer nofollow noopener"
                  >
                    <Image
                      src="/images/twitter_icon.svg"
                      width={24}
                      height={24}
                      alt="Twitter"
                    />
                  </a>
                  <a
                    href="https://github.com/Nearblocks"
                    target="_blank"
                    className="ml-2"
                    rel="noreferrer nofollow noopener"
                  >
                    <Image
                      src="/images/github_icon.svg"
                      width={24}
                      height={24}
                      alt="Github"
                    />
                  </a>
                </div>
              </div>

              <div className="hidden lg:!block"></div>
              <div className="">
                <div className="text-green-500 font-semibold text-xl mb-3">
                  &nbsp;
                </div>
                <ul className="text-black opacity-80 footer-links text-sm leading-6">
                  <li>
                    <Link href="/">&nbsp;</Link>
                  </li>
                </ul>
              </div>
              <div className="">
                <div className="text-green-500 font-semibold text-xl mb-3">
                  Tools
                </div>
                <ul className="text-black opacity-80 footer-links text-sm leading-6">
                  <li>
                    <Link href="https://nearblocks.io/apis" legacyBehavior>
                      <a target="_blank" rel="noreferrer nofollow noopener">
                        {t('footer.links.api')}
                        <span className="mx-2 px-1 py-0.5 font-semibold animate-pulse text-white bg-brightgreen rounded text-tiny">
                          New
                        </span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="https://nearsend.io" legacyBehavior>
                      <a
                        className="flex"
                        target="_blank"
                        rel="noreferrer nofollow noopener"
                      >
                        Near Token Bulksender
                        <span>
                          <Arrow className="-rotate-45 -mt-1 h-4 w-4" />
                        </span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="https://nkyc.io" legacyBehavior>
                      <a
                        className="flex"
                        target="_blank"
                        rel="noreferrer nofollow noopener"
                      >
                        Near KYC Platform
                        <span>
                          <Arrow className="-rotate-45 -mt-1 h-4 w-4" />
                        </span>
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="">
                <div className="text-green-500 font-semibold text-xl mb-3">
                  {t('footer.links.explore')}
                </div>
                <ul className="text-black opacity-80 footer-links text-sm leading-6">
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
                </ul>
              </div>
              <div className="">
                <div className="text-green-500 font-semibold text-xl mb-3">
                  {t('footer.links.company')}
                </div>
                <ul className="text-black opacity-80 footer-links text-sm leading-6">
                  <li>
                    <Link href="/about" legacyBehavior>
                      <a>{t('footer.links.about')}</a>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://careers.near.org/companies/invoker-labs"
                      legacyBehavior
                    >
                      <a
                        className="flex"
                        target="_blank"
                        rel="noreferrer nofollow noopener"
                      >
                        Careers
                        <span>
                          <Arrow className="-rotate-45 -mt-0 h-4 w-4" />
                        </span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/advertise" legacyBehavior>
                      <a>{t('footer.links.advertise')}</a>
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
                </ul>
              </div>
            </div>
            <div className="flex justify-between border-t border-gray-200">
              <p className="text-green-500 text-xs py-4 text-center ">
                NearBlocks © {currentDate.getFullYear()}
              </p>
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
