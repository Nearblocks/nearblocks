'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import React from 'react';

import { Link } from '@/i18n/routing';

export const Policy = ({ theme: cookieTheme }: { theme: string }) => {
  let { theme } = useTheme();

  if (theme == undefined) {
    theme = cookieTheme;
  }

  return (
    <div className="relative container-xxl mx-auto px-5 py-10">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-9">
          <div className="flex flex-col">
            <div className="flex flex-col mx-2">
              <div className="relative overflow-hidden">
                <div className="bg-green-500 dark:bg-black-600 p-6 pb-8 rounded-xl">
                  <div className="flex flex-col md:flex-row justify-between gap-6 py-8 pr-8 md:pl-8 mb-2">
                    <div className="md:order-2 w-[250px]">
                      <Link href="/">
                        {theme === 'dark' ? (
                          <span className="flex justify-start items-center hover:no-underline py-2 rounded-lg dark:bg-black-600 dark:text-neargray-10">
                            <Image
                              alt="NearBlocks"
                              className="block"
                              height="40"
                              layout="fixed"
                              loading="eager"
                              src={'/images/nearblocksblack_dark.svg'}
                              width="174"
                            />
                          </span>
                        ) : (
                          <span className="flex justify-start items-center hover:no-underline bg-white py-2 px-6 rounded-lg  dark:bg-black-600 dark:text-neargray-10">
                            <Image
                              alt="NearBlocks"
                              className="block"
                              height="40"
                              layout="fixed"
                              loading="eager"
                              src={'/images/nearblocksblack.svg'}
                              width="174"
                            />
                          </span>
                        )}
                      </Link>
                    </div>
                    <div className="order-1">
                      <h1 className="text-3xl text-neargray-10 font-bold pb-2">
                        Privacy Policy
                      </h1>
                      <p className="text-white text-opacity-75 mb-0 font-thin">
                        Last updated: Nov 28, 2024
                      </p>
                    </div>
                  </div>
                  <figure className="hidden md:block absolute left-0 right-0">
                    <svg
                      className={
                        theme === 'dark' ? 'fill-black-600' : 'fill-white'
                      }
                      height="32"
                      preserveAspectRatio="none"
                      viewBox="0 0 1920 100.1"
                      width="100%"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M0,0c0,0,934.4,93.4,1920,0v100.1H0L0,0z"></path>
                    </svg>
                  </figure>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start mx-2">
              <div className="text-base text-neargray-600 dark:text-neargray-10 pt-12 pb-16 px-6 w-full bg-white dark:bg-black-600 flex flex-col gap-6">
                <p className="font-extrabold">
                  PLEASE READ THE PRIVACY POLICY CAREFULLY.
                </p>
                <p>
                  nearblocks.io (referred to as the “Company”, “Nearblocks”,
                  “we”, “our” or “us”) is committed to the protection of your
                  Personal Data and takes the matter of protecting your privacy
                  as high priority.
                </p>

                <p>
                  <span className="font-semibold">
                    1. TYPES OF DATA WE COLLECT
                  </span>
                  <br />
                  The types of Personal Data that we collect directly from you
                  or from third parties depend on the circumstances of
                  collection and on the nature of the service requested or
                  transaction undertaken. It may include (but is not limited
                  to):
                </p>
                <p>
                  (a) personal information that links back to an individual,
                  e.g., name, gender, date of birth, and other personal
                  identification numbers;
                </p>
                <p>
                  (b) contact information, e.g., address, phone number and email
                  address;
                </p>
                <p>
                  (<span className="p-[0.1px]">c</span>) technical information,
                  e.g., IP address for API services and login;
                </p>

                <p>(d) statistical data, e.g., hits to website.</p>
                <p>
                  This Privacy Policy covers the information we collect about
                  you when you use our products or services, or otherwise
                  interact with Nearblocks, unless a different privacy policy is
                  displayed. This policy also explains your choices about how we
                  use information about you.
                </p>
                <p>
                  Your choices include how you can object to certain uses of
                  information about you and how you can access and update
                  certain information about you. If you do not agree to the
                  terms of this Policy, please do not use the Site, or any of
                  our Services. Each time you use any Site, or any Services, the
                  current version of this Privacy Policy will apply.
                </p>

                <p className="font-semibold">
                  2. HOW DO WE COLLECT PERSONAL DATA?
                </p>

                <p>
                  This Privacy Policy covers any Personal Data provided to us:
                </p>
                <p>(a) when you engage with our products and services;</p>
                <p>(b) when you create an account with us;</p>
                <p>
                  (<span className="p-[0.1px]">c</span>) under any other
                  contractual agreement or arrangement.
                </p>

                <p>
                  Some of the other ways we may collect Personal Data shall
                  include (but is not limited to):
                </p>
                <p>
                  (a) communications with you via telephone, letter, fax and
                  email;
                </p>
                <p>(b) when you visit our website;</p>
                <p>
                  (<span className="p-[0.1px]">c</span>) when you contact us in
                  person;
                </p>
                <p>(d) when we contact you in person;</p>
                <p>
                  (e) when we collect information about you from third parties;
                  and other channels including our support helpdesk.
                </p>

                <p className="font-semibold">
                  3. HOW DO WE COLLECT YOUR PERSONAL DATA ON OUR WEBSITE?
                </p>

                <p>
                  From our website, we collect your Personal Data in the
                  following ways:
                </p>
                <p>(a) IP address</p>
                <p>
                  We use your IP address to help diagnose problems with our
                  server, and to administer our website.
                </p>
                <p>(b) Cookies</p>
                <p>
                  A cookie is an element of data that a website can send to your
                  browser, which may then store it on your system. We use
                  cookies in some of our pages to store your preferences and
                  record session information. The information that we collect is
                  then used to ensure a more personalized service level for our
                  users. You can adjust settings on your browser so that you
                  will be notified when you receive a cookie. Please refer to
                  your browser documentation to check if cookies have been
                  enabled on your computer or to request not to receive cookies.
                </p>
                <p>
                  As cookies allow you to take advantage of some of the
                  Website’s essential features, we recommend that you accept
                  cookies. For instance, if you block or otherwise reject our
                  cookies, you will not be able to use any products or services
                  on the website that may require you to log-in (token holdings
                  store cookies for favorite).
                </p>
                <p>
                  It is important that you prevent unauthorized access to your
                  password and your computer. You should always log out after
                  using a shared computer. Information collected from cookies is
                  used by us to evaluate the effectiveness of our site, analyze
                  trends, and manage the platform. The information collected
                  from cookies allows us to determine such things as which parts
                  of our site are most visited and difficulties our visitors may
                  experience in accessing our site.
                </p>
                <p>
                  With this knowledge, we can improve the quality of your
                  experience on the platform by recognizing and delivering more
                  of the most desired features and information, as well as by
                  resolving access difficulties. We also use cookies and/or a
                  technology known as web bugs or clear gifs, which are
                  typically stored in emails to help us confirm your receipt of,
                  and response to our emails and to provide you with a more
                  personalized experience when using our site. Your continued
                  use of this site, as well as any subsequent usage, will be
                  interpreted as your consent to cookies being stored on your
                  device.
                </p>
                <p>
                  (<span className="p-[0.1px]">c</span>) User feedback form
                </p>
                <p>
                  Our feedback form requires you to give us contact information
                  (e.g. your name and email address) so that we can respond to
                  your comments. We use your contact information from the
                  registration form to send you information about our company.
                  Your contact information is also used to contact you where
                  necessary.
                </p>
                <p>(d) General Site tracking</p>
                <p>
                  We also use third party service provider(s), to assist us in
                  better understanding the use of our site. Our service
                  provider(s) will place cookies on the hard drive of your
                  computer and will receive information that we select, for
                  example, how visitors navigate around our site, what pages are
                  browsed and general transaction information. Our service
                  provider(s) analyzes this information and provides us with
                  aggregate reports.
                </p>
                <p>
                  The information and analysis provided by our service
                  provider(s) will be used to assist us in better understanding
                  our visitors&apos; interests in our site and how to better
                  serve those interests. The information collected by our
                  service provider(s) may be linked to and combined with
                  information that we collect about you while you are using the
                  platform. Our service provider(s) is/are contractually
                  restricted from using information they receive from our Site
                  other than to assist us.
                </p>
                <p>(e) Web Server site visits logging</p>
                <p>
                  The following is how we store the web server site visit logs
                  (applicable to https://nearblocks.io):
                </p>
                <p>
                  (i) To throttle the rate of requests and prevent certain types
                  of attacks against us, we track the incoming IP addresses for
                  very short periods of time and is then released.
                </p>
                <p>
                  (ii) By default, we do NOT store identifiable
                  &apos;x-forwarded-for&apos; originating IPs during your site
                  visit in the Web Server site visits logs.
                </p>
                <p>
                  (iii) However in the event of certain types of third-party
                  attacks, general server/application troubleshooting or other
                  related reasons, we might temporarily activate the
                  &apos;x-forwarded-for&apos; logging.
                </p>
                <p>
                  (iv) As part of our routine server maintenance, all raw web
                  server site visit logs are retained for a minimum of 5 days
                  only and then purged on an automated scheduled basis.
                </p>

                <p className="font-semibold">
                  4. WHAT DO WE USE YOUR PERSONAL DATA FOR?
                </p>

                <p>We may use your Personal Data for the following purposes:</p>

                <p>
                  (a) to enable us to provide our services and perform our
                  services to you;
                </p>
                <p>
                  (b) to protect the safety and well being of yourself and/or
                  other customers;
                </p>
                <p>
                  (<span className="p-[0.1px]">c</span>) to investigate and
                  respond to claims and inquiries from you;
                </p>
                <p>
                  (d) for business development purposes such as statistical and
                  marketing analysis, systems testing, maintenance and
                  development, customer surveys or to help us in any future
                  dealings with you, for example by identifying your
                  requirements and preference;
                </p>
                <p>
                  (e) to comply with any legal or regulatory requirements; and/
                  or
                </p>
                <p>
                  (f) for all other purposes ancillary to any of the purposes
                  stated above. (&quot;Core Purposes&quot;)
                </p>
                <p>
                  (g) to communicate offers, product, services and information
                  on products and activities;
                </p>
                <p>
                  (h) marketing/cross-marketing and communicating with you in
                  relation to products and services offered by us and our
                  service partners as well as our appointed agents; and/or
                </p>
                <p>
                  (i) for all other purposes ancillary to any of the purposes
                  stated above. (&quot;Ancillary Purposes&quot;) (collectively,
                  &quot;Purposes&quot;)
                </p>

                <p className="font-semibold">
                  5. ACCESSING / CORRECTING / UPDATING YOUR PERSONAL DATA
                </p>

                <p>
                  You may request to obtain information of your personal data
                  and also update or make amendments to your personal data as
                  below: for online registered customers, you may login to your
                  online account and update your personal data.
                </p>

                <p className="font-semibold">6. WITHDRAWING CONSENT</p>

                <p>
                  Please note that it is obligatory for the Company to process
                  your Personal Data for the Core Purpose as stated above,
                  without which some services or features provided by Nearblocks
                  may be affected
                </p>

                <p>
                  If we do not have your consent to process your Personal Data
                  for the Ancillary Purposes, we will not be able to keep you
                  updated about our future, new and/or enhanced services and
                  products. Nevertheless, you may stop receiving promotional
                  activities by:
                </p>

                <p>(a) unsubscribing from the mailing list;</p>

                <p>
                  (b) editing the relevant account settings to unsubscribe; or
                </p>

                <p>
                  (<span className="p-[0.1px]">c</span>) sending a request via
                  &nbsp;
                  <Link
                    className="text-green-500 dark:text-green-250"
                    href={'/contact'}
                  >
                    Contact Us.
                  </Link>
                </p>

                <p className="font-semibold">
                  7. TO WHOM DO WE DISCLOSE YOUR PERSONAL DATA?
                </p>

                <p>
                  We will not trade or sell your Personal Data to third parties.
                  Your Personal Data shall only be disclosed or transferred to
                  the following third parties appointed or authorised by the
                  Company for the fulfilment of the Purpose of: (a) data
                  warehouses; (b) IT service providers; (
                  <span className="p-[0.1px]">c</span>) data analytics and/or
                  marketing agency; (d) legal bodies as permitted or required by
                  law such as in compliance with a warrant or subpoena issued by
                  a court of competent jurisdiction; and/or (e) regulatory
                  authorities applicable to you; and/or (f) safety and security
                  personnel.
                </p>

                <p>
                  In addition to the above, your Personal Data may also be
                  disclosed or transferred to any of the Company’s actual and
                  potential assignee, transferee or acquirer (including our
                  affiliates and subsidiaries) or our business, assets or group
                  companies, or in connection with any corporate restructuring
                  or exercise including the our restructuring to transfer the
                  business, assets and/or liabilities.
                </p>
                <p>
                  We shall take practical steps to ensure that their employees,
                  officers, agents, consultants, contractors and such other
                  third parties mentioned above who are involved in the
                  collection, use and disclosure of your Personal Data will
                  observe and adhere to the terms of this Privacy Statement.
                </p>
                <p>
                  We are subject to various legal and regulatory obligations
                  imposed by the laws and supervisory authorities of various
                  jurisdictions e.g., anti-money laundering laws, anti-terrorism
                  financing, financial services laws, corporation laws and
                  privacy laws. These obligations may require us to process
                  certain data for payment processing, compliance with court
                  orders or other purposes not disclosed herein.
                </p>

                <p className="font-semibold">
                  8. HOW LONG WILL WE RETAIN YOUR PERSONAL DATA?
                </p>

                <p>
                  The Company stores data in global hosting provider with
                  servers across regions and we shall take all reasonable steps
                  to ensure that all Personal Data is destroyed or permanently
                  deleted when no longer required for the Purpose and prepare a
                  disposal schedule for inactive data after 24 month period.
                </p>

                <p className="font-semibold">
                  9. LINKS TO THIRD PARTY WEBSITES
                </p>

                <p>
                  We may link this website and/or our applications to other
                  companies’ or organizations’ websites (collectively, “Third
                  Party Sites”). This Privacy Notice does not apply to such
                  Third Party Sites as those sites are outside our control. If
                  you access Third Party Sites using the links provided, the
                  operators of these sites may collect your personal
                  information.
                </p>

                <p>
                  Please ensure that you are satisfied with the privacy
                  statements of these Third Party Sites before you submit any
                  personal information. We try, as far as we can, to ensure that
                  all third party linked sites have equivalent measures for
                  protection of your personal information, but we cannot be held
                  responsible legally or otherwise for the activities, privacy
                  policies or levels of privacy compliance of these Third Party
                  Sites.
                </p>

                <p className="font-semibold">
                  10. ADDITIONAL INFORMATION OR ASSISTANCE
                </p>

                <p>
                  Please note that this Privacy Statement may be amended from
                  time to time in accordance to applicable laws and regulations
                  and such variations may be applicable to you.
                </p>

                <p>
                  For further inquiries or complaints in relation to our
                  handling of your Personal Data or our Privacy Policy or wish
                  to access, update or amend your Personal Data as mentioned
                  above please contact us via our feedback form at{' '}
                  <Link
                    className="text-green-500 dark:text-green-250"
                    href={'/contact'}
                  >
                    Contact Us.
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
