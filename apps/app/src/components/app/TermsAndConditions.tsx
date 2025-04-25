'use client';

import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const TermsAndConditions = ({ theme: cookieTheme }: { theme: string }) => {
  let { theme } = useTheme();
  if (theme == undefined) {
    theme = cookieTheme;
  }

  return (
    <div className="relative container-xxl mx-auto px-5 py-10 ">
      <div className="row justify-content-center ">
        <div className="col-lg-10 col-xl-9">
          <div className="flex flex-col ">
            <div className="flex flex-col mx-2 ">
              <div className="relative overflow-hidden border-t border-x-[0.5px] dark:border-black-200 rounded-t-xl bg-white dark:bg-black-600">
                <div
                  className="bg-hero-pattern dark:bg-hero-pattern-dark px-6 pb-1 rounded-xl "
                  style={{
                    clipPath: 'ellipse(120% 100% at 50% 0%)',
                    transition: 'clip-path 0.3s ease-in-out',
                  }}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6 py-8 pr-8 mb-2">
                    <div className="md:order-2 w-[180px]">
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
                          <span className="flex justify-start items-center hover:no-underline bg-white dark:bg-black-600 py-2 px-6 rounded-lg dark:text-neargray-10">
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
                      <h1 className="md:text-2xl text-2xl text-neargray-10 font-medium pt-2 whitespace-nowrap">
                        Terms of Service
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start mx-2">
              <div className="text-base text-neargray-600 dark:text-neargray-10 pt-12 pb-16 px-6 w-full bg-white dark:bg-black-600 flex flex-col gap-6 rounded-b-md border-b border-x-[0.5px] dark:border-black-200">
                <p className="font-extrabold">
                  PLEASE READ THESE TERMS OF SERVICE CAREFULLY.
                </p>

                <p>
                  BY ACCESSING OR USING OUR SERVICES, YOU AGREE TO BE BOUND BY
                  THESE TERMS OF SERVICE AND ALL TERMS INCORPORATED BY
                  REFERENCE.
                </p>

                <p>
                  These Terms of Service and any terms expressly incorporated
                  herein (&quot;Terms&quot;) apply to your access to and use of
                  all services (our &quot;Services&quot;) provided by
                  nearblocks.io (&quot;Company,&quot; &quot;we,&quot; or
                  &quot;us&quot;)
                </p>
                <p className="font-semibold">1. ELIGIBILITY</p>
                <p>
                  You represent and warrant that you: (a) are of legal age to
                  form a binding contract; (b) have not previously been
                  suspended or removed from using our Services; and (c) have
                  full power and authority to enter into this agreement and in
                  doing so will not violate any other agreement to which you are
                  a party.
                </p>

                <p>
                  If you are registering to use the Services on behalf of a
                  legal entity, you further represent and warrant that (i) such
                  legal entity is duly organized and validly existing under the
                  applicable laws of the jurisdiction of its organization, and
                  (ii) you are duly authorized by such legal entity to act on
                  its behalf.
                </p>

                <p className="font-semibold">2. DISCONTINUANCE OF SERVICES</p>

                <p>
                  We may, in our sole discretion and without liability to you,
                  with or without prior notice and at any time, modify or
                  discontinue, temporarily or permanently, any portion of our
                  Services.
                </p>

                <p className="font-semibold">3. ASSUMPTION OF RISK</p>

                <p>
                  You acknowledge and agree that there are risks associated with
                  utilizing an Internet-based service including, but not limited
                  to, the risk of failure of hardware, software and Internet
                  connections, the risk of malicious software introduction, and
                  the risk that third parties may obtain unauthorized access to
                  information stored.
                </p>

                <p>
                  You acknowledge and agree that Company will not be responsible
                  for any communication failures, disruptions, errors,
                  distortions or delays you may experience when using the
                  Services, however caused. Company takes no responsibility for
                  and will not be liable for any losses, damages or claims
                  arising from the use of our Services, including, but not
                  limited to, any losses, damages or claims.
                </p>

                <p className="font-semibold">
                  4. THIRD-PARTY SERVICES AND CONTENT
                </p>

                <p>
                  In using our Services, you may view content or utilize
                  services provided by third parties, including links to web
                  pages and services of such parties (&quot;Third-Party
                  Content&quot;).
                </p>

                <p>
                  We do not control, endorse or adopt any Third-Party Content
                  and will have no responsibility for Third-Party Content,
                  including, without limitation, material that may be
                  misleading, incomplete, erroneous, offensive, indecent or
                  otherwise objectionable in your jurisdiction.
                </p>

                <p>
                  In addition, your business dealings or correspondence with
                  such third parties are solely between you and the third
                  parties. We are not responsible or liable for any loss or
                  damage of any sort incurred as the result of any such
                  dealings, and you understand that your use of Third-Party
                  Content, and your interactions with third parties, is at your
                  own risk.
                </p>

                <p className="font-semibold">5. ACCEPTABLE USE</p>

                <p>
                  When accessing or using the Services, you agree that you will
                  not violate any law, contract, intellectual property or other
                  third-party right or commit a tort, and that you are solely
                  responsible for your conduct while using our Services. You
                  must not:
                </p>

                <p>
                  Use our Services in any manner that could interfere with,
                  disrupt, negatively affect or inhibit other users from fully
                  enjoying our Services, or that could damage, disable,
                  overburden or impair the functioning of our Services in any
                  manner;
                </p>

                <p>
                  Use our Services to pay for, support or otherwise engage in
                  any illegal activities, including, but not limited to illegal
                  gambling, fraud, money-laundering, or terrorist activities;
                </p>

                <p>
                  Use any robot, spider, crawler, scraper or other automated
                  means or interface not provided by us to access our Services
                  or to extract data;
                </p>

                <p>
                  Engage in Automated Data Collection (scraping) unless such
                  Automated Data Collection is confined solely to search
                  indexing for display on the Internet;
                </p>

                <p>
                  Use or attempt to use another user&rsquo;s account without
                  authorization;
                </p>

                <p>
                  Attempt to circumvent any content filtering techniques we
                  employ, or attempt to access any service or area of our
                  Services that you are not authorized to access;
                </p>

                <p>
                  Introduce to the Services any virus, trojan worms, logic bombs
                  or other harmful material;
                </p>

                <p>
                  Develop any third-party applications that interact with our
                  Services without our prior written consent;
                </p>

                <p>Provide false, inaccurate, or misleading information; and</p>

                <p>
                  Encourage or induce any third party to engage in any of the
                  activities prohibited under this Section.
                </p>

                <p className="font-semibold">6. USER-GENERATED CONTENT</p>

                <p>
                  6.1. Responsibility for User-Generated Content - You are
                  solely responsible for the content of, and for any harm
                  resulting from, any User-Generated Content that you post,
                  upload, link to or otherwise make available via the Service,
                  regardless of the form of that Content. We are not responsible
                  for any public display or misuse of your User-Generated
                  Content. We have the right (though not the obligation) to
                  refuse or remove any User-Generated Content that, in our sole
                  discretion, violates any NearBlocks terms or policies.
                </p>

                <p>
                  6.2. Ownership of Content &amp; Right to Post - If you&#39;re
                  posting anything you did not create yourself or do not own the
                  rights to, you agree that you are responsible for any Content
                  you post; that you will only submit Content that you have the
                  right to post; and that you will fully comply with any third
                  party licenses relating to Content you post.
                </p>

                <p>
                  6.3. License Grant to Us - We need the legal right to do
                  things like host Your Content, publish it, and share it. You
                  grant us and our legal successors the right to store, parse,
                  and display your content, and make incidental copies as
                  necessary to render the Website and provide the service.
                </p>

                <p>
                  6.4. Moral Rights - You retain all moral rights to Your
                  Content that you upload, publish, or submit to any part of the
                  Service, including the rights of integrity and attribution.
                  However, you waive these rights and agree not to assert them
                  against us, to enable us to reasonably exercise the rights
                  granted in Section 6.3.
                </p>

                <p>
                  6.5. To the extent this agreement is not enforceable by
                  applicable law, you grant NearBlocks the rights we need to use
                  your content without attribution and to make reasonable
                  adaptations of your content as necessary to render the Website
                  and provide the service.
                </p>

                <p className="font-semibold">
                  7. COPYRIGHTS AND OTHER INTELLECTUAL PROPERTY RIGHTS
                </p>

                <p>
                  Unless otherwise indicated by us, all copyright and other
                  intellectual property rights in all content and other
                  materials contained on our website or provided in connection
                  with the Services, including, without limitation, the Company
                  or Company logo and all designs, text, graphics, pictures,
                  information, data, software, sound files, other files and the
                  selection and arrangement thereof (collectively, &quot;Company
                  Materials&quot;) are the proprietary property of Company or
                  our licensors or suppliers and are protected by copyright laws
                  and other intellectual property rights laws.
                </p>

                <p>
                  Unauthorized use and/or duplication of this material without
                  express and written permission from this site&rsquo;s author
                  and/or owner is strictly prohibited. Excerpts and links may be
                  used, provided that full and clear credit is given to
                  nearblocks.io with appropriate and specific direction to the
                  original content.
                </p>

                <p className="font-semibold">8. TRADEMARKS</p>

                <p>
                  &quot;NearBlocks&quot; the Company logo, and any other Company
                  product or service names, logos or slogans that may appear on
                  our Services are trademarks of Company and may not be copied,
                  imitated or used, in whole or in part, without our prior
                  written permission.
                </p>

                <p>
                  You will not use any trademark, product or service name of
                  Company without our prior written permission, including
                  without limitation any metatags or other &quot;hidden
                  text&quot; utilizing any trademark, product or service name of
                  Company. In addition, the look and feel of our Services,
                  including all page headers, custom graphics, button icons and
                  scripts, is the service mark, trademark and/or trade dress of
                  Company and may not be copied, imitated or used, in whole or
                  in part, without our prior written permission.
                </p>

                <p>
                  All other trademarks, registered trademarks, product names and
                  company names or logos mentioned through our Services are the
                  property of their respective owners. Reference to any
                  products, services, processes or other information, by name,
                  trademark, manufacturer, supplier or otherwise does not
                  constitute or imply endorsement, sponsorship or recommendation
                  by us.
                </p>

                <p className="font-semibold">9. SUSPENSION; TERMINATION</p>

                <p>
                  In the event of any Force Majeure Event, breach of these
                  Terms, or any other event that would make provision of the
                  Services commercially unreasonable for Company, we may, in our
                  discretion and without liability to you, with or without prior
                  notice, suspend your access to all or a portion of our
                  Services.
                </p>

                <p>
                  We may terminate your access to the Services in our sole
                  discretion, immediately and without prior notice, and delete
                  or deactivate your Account and all related information and
                  files in such account without liability to you, including, for
                  instance, in the event that you breach any term of these
                  Terms.
                </p>

                <p className="font-semibold">10. COOKIE STATEMENT</p>

                <p>
                  This site uses cookies. Cookies are small text files that are
                  placed on your computer by websites that you visit. They are
                  widely used in order to make websites work, or work more
                  efficiently, as well as to provide information to the owners
                  of the site. Cookies are typically stored on your
                  computer&#39;s hard drive.
                </p>

                <p>
                  Information collected from cookies is used by us to evaluate
                  the effectiveness of our Site, analyze trends, and manage the
                  platform. The information collected from cookies allows us to
                  determine such things as which parts of our Site are most
                  visited and difficulties our visitors may experience in
                  accessing our Site. With this knowledge, we can improve the
                  quality of your experience on the platform by recognizing and
                  delivering more of the most desired features and information,
                  as well as by resolving access difficulties. We also use
                  cookies and/or a technology known as web bugs or clear gifs,
                  which are typically stored in emails to help us confirm your
                  receipt of, and response to, our emails and to provide you
                  with a more personalized experience when using our Site.
                </p>

                <p>
                  We also use third party service provider(s), to assist us in
                  better understanding the use of our Site. Our service
                  provider(s) will place cookies on the hard drive of your
                  computer and will receive information that we select that will
                  educate us on such things as how visitors navigate around our
                  site, what pages are browsed and general transaction
                  information. Our service provider(s) analyses this information
                  and provides us with aggregate reports. The information and
                  analysis provided by our service provider(s) will be used to
                  assist us in better understanding our visitors&#39; interests
                  in our Site and how to better serve those interests. The
                  information collected by our service provider(s) may be linked
                  to and combined with information that we collect about you
                  while you are using the platform. Our service provider(s)
                  is/are contractually restricted from using information they
                  receive from our Site other than to assist us.
                </p>

                <p>
                  Your continued use of this site, as well as any subsequent
                  usage, will be interpreted as your consent to cookies being
                  stored on your device.
                </p>

                <p className="font-semibold">11. PRIVACY POLICY</p>

                <p>
                  Please see our detailed
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline ml-1"
                    href={'/privacy-policy'}
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>

                <p className="font-semibold">12. DISCLAIMER OF WARRANTIES</p>

                <p>
                  (a) TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, AND
                  EXCEPT AS EXPRESSLY PROVIDED TO THE CONTRARY IN A WRITING BY
                  US, OUR SERVICES ARE PROVIDED ON AN &quot;AS IS&quot; AND
                  &quot;AS AVAILABLE&quot; BASIS TO THE MAXIMUM EXTENT PERMITTED
                  UNDER APPLICABLE LAW. WE EXPRESSLY DISCLAIM, AND YOU WAIVE,
                  ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED,
                  INCLUDING, WITHOUT LIMITATION, IMPLIED WARRANTIES OF
                  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND
                  NON-INFRINGEMENT AS TO OUR SERVICES, INCLUDING THE
                  INFORMATION, CONTENT AND MATERIALS CONTAINED THEREIN.
                </p>

                <p>
                  (b) YOU ACKNOWLEDGE THAT INFORMATION YOU STORE OR TRANSFER
                  THROUGH OUR SERVICES MAY BECOME IRRETRIEVABLY LOST OR
                  CORRUPTED OR TEMPORARILY UNAVAILABLE DUE TO A VARIETY OF
                  CAUSES, INCLUDING SOFTWARE FAILURES, PROTOCOL CHANGES BY THIRD
                  PARTY PROVIDERS, INTERNET OUTAGES, FORCE MAJEURE EVENT OR
                  OTHER DISASTERS, SCHEDULED OR UNSCHEDULED MAINTENANCE, OR
                  OTHER CAUSES EITHER WITHIN OR OUTSIDE OUR CONTROL. YOU ARE
                  SOLELY RESPONSIBLE FOR BACKING UP AND MAINTAINING DUPLICATE
                  COPIES OF ANY INFORMATION YOU STORE OR TRANSFER THROUGH OUR
                  SERVICES.
                </p>

                <p className="font-semibold">13. LIMITATION OF LIABILITY</p>

                <p>
                  EXCEPT AS OTHERWISE REQUIRED BY LAW, IN NO EVENT SHALL
                  COMPANY, OUR DIRECTORS, MEMBERS, EMPLOYEES OR AGENTS BE LIABLE
                  FOR ANY SPECIAL, INDIRECT OR CONSEQUENTIAL DAMAGES, OR ANY
                  OTHER DAMAGES OF ANY KIND, INCLUDING BUT NOT LIMITED TO LOSS
                  OF USE, LOSS OF PROFITS OR LOSS OF DATA, WHETHER IN AN ACTION
                  IN CONTRACT, TORT (INCLUDING BUT NOT LIMITED TO NEGLIGENCE) OR
                  OTHERWISE, ARISING OUT OF OR IN ANY WAY CONNECTED WITH THE USE
                  OF OR INABILITY TO USE OUR SERVICES OR THE COMPANY MATERIALS,
                  INCLUDING WITHOUT LIMITATION ANY DAMAGES CAUSED BY OR
                  RESULTING FROM RELIANCE BY ANY USER ON ANY INFORMATION
                  OBTAINED FROM COMPANY, OR THAT RESULT FROM MISTAKES,
                  OMISSIONS, INTERRUPTIONS, DELETION OF FILES OR EMAIL, ERRORS,
                  DEFECTS, VIRUSES, DELAYS IN OPERATION OR TRANSMISSION OR ANY
                  FAILURE OF PERFORMANCE, WHETHER OR NOT RESULTING FROM A FORCE
                  MAJEURE EVENT, COMMUNICATIONS FAILURE, THEFT, DESTRUCTION OR
                  UNAUTHORIZED ACCESS TO COMPANY&rsquo;S RECORDS, PROGRAMS OR
                  SERVICES.
                </p>

                <p className="font-semibold">14. INDEMNITY</p>

                <p>
                  You agree to defend, indemnify and hold harmless Company (and
                  each of our officers, directors, members, employees, agents
                  and affiliates) from any claim, demand, action, damage, loss,
                  cost or expense, including without limitation reasonable
                  attorneys&rsquo; fees, arising out or relating to:
                </p>

                <p>
                  (a) your use of, or conduct in connection with, our Services;
                </p>

                <p>(b) any Feedback you provide;</p>

                <p>(c) your violation of these Terms; or</p>

                <p>
                  (d) your violation of any rights of any other person or
                  entity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
