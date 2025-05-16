'use client';
import { useSearchParams } from 'next/navigation';
import React, { ReactNode, useEffect, useState } from 'react';

import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from '@/components/ui/accordion';
import { Link } from '@/i18n/routing';

import ArrowDown from '@/components/app/Icons/ArrowDown';
import FormContact from '@/components/app/Contact/FormContact';

type itemProps = {
  className?: string;
  description: ReactNode | string;
  index: number;
  title: string;
};

const ContactActions = ({ getContactDetails }: any) => {
  const [selectedValue, setSelectedValue] = useState('0');
  const [isOpen, setIsOpen] = useState(true);
  const [indices, setIndices] = useState<number[]>([]);
  const [showFormContact, setShowFormContact] = useState(false);

  const searchParams = useSearchParams();
  const subject = searchParams?.get('subject');

  useEffect(() => {
    if (subject === 'apis') {
      setSelectedValue('2');
    }
  }, [subject]);

  const toggleItem = (index: number) => {
    setIndices((prevIndices) => {
      const newIndices = prevIndices.includes(index) ? [] : [index];
      return newIndices;
    });
  };

  const Items = ({ className, description, index, title }: itemProps) => {
    return (
      <AccordionItem
        _open={{
          animation: 'slide-down 4s ease forwards',
        }}
        key={index}
        value={index.toString()}
      >
        <AccordionItemTrigger
          buttonColor={
            indices.includes(index) ? 'text-green-500 dark:text-green-250' : ''
          }
          className={`w-full flex justify-between items-center text-sm text-gray-600 dark:text-neargray-10 focus:outline-none p-3 ${
            indices.includes(index) ? 'bg-gray-50 dark:bg-black-200' : className
          }`}
          onClick={() => toggleItem(index)}
        >
          <h2 className="text-green-250 text-left">{title}</h2>
        </AccordionItemTrigger>
        <AccordionItemContent
          className={`text-sm text-left  text-neargray-600 dark:text-neargray-10 px-3 ${className}`}
        >
          <div className="mr-3">{description}</div>
        </AccordionItemContent>
      </AccordionItem>
    );
  };

  const handleChange = (event: any) => {
    const value = event.target.value;
    setSelectedValue(value);
    setIndices([]);
    if (value === '4') {
      window.location.href =
        'https://github.com/Nearblocks/nearblocks/issues/new?assignees=&labels=&projects=&template=bug_report.md&title=';
      return;
    }

    if (value === '5') {
      window.location.href =
        'https://github.com/Nearblocks/nearblocks/issues/new?assignees=&labels=&projects=&template=feature_request.md&title=';
      return;
    }

    if (value === '6') {
      window.location.href =
        'https://github.com/Nearblocks/nearblocks/issues/new?assignees=&labels=&projects=&template=token_request.md&title=';
      return;
    }

    if (value !== '1') {
      setShowFormContact(false);
      setIsOpen(true);
    }
  };

  const handleContactClick = () => {
    setShowFormContact(true);
    setIsOpen(false);
  };

  const accordionData = {
    featuresAndServices: [
      {
        description: (
          <span>
            NearBlocks lets you easily look up transactions, check smart
            contracts, explore
            <Link
              className="text-green-500 dark:text-green-250 cursor-pointer ml-1"
              href={'/charts'}
            >
              charts and stats
            </Link>
            , and the latest updates on the NEAR blockchain. Developers can also
            use our
            <Link
              className="text-green-500 dark:text-green-250 cursor-pointer mx-1"
              href={'/apis'}
            >
              API
            </Link>
            services to build apps or gather blockchain data.
          </span>
        ),
        title: 'What can I do on NearBlocks?',
      },
      {
        description:
          'You can access most features on NearBlocks without signing in. However, some exclusive features, like commenting, require signing in with your wallet.',
        title: 'Do I need an account to use NearBlocks?',
      },
      {
        description: (
          <span>
            If you encounter a bug, please report it
            <a
              className="text-green-500 dark:text-green-250 cursor-pointer ml-1"
              href={'https://github.com/Nearblocks/nearblocks/issues'}
              rel="noopener noreferrer"
              target="_blank"
            >
              here
            </a>
            .
          </span>
        ),
        title: 'How can I report a bug on NearBlocks?',
      },
    ],
    Introduction: [
      {
        description:
          'NearBlocks is an easy-to-use blockchain explorer and analytics platform for the Near Protocol.',
        title: 'What is NearBlocks?',
      },
      {
        description:
          'NearBlocks makes it easy to access and understand blockchain data on the NEAR network. With NearBlocks, you can view transactions, review wallet histories, interact with smart contracts, and more.',
        title: 'What does NearBlocks offer?',
      },
      {
        description:
          "NearBlocks doesn't process transactions, move assets between wallets, recover lost funds, or access your private keys. We're not a wallet or exchange service, so we can't reverse transactions or retrieve lost assets.",
        title: "What NearBlocks can't do?",
      },
      {
        description: (
          <span>
            You were likely sent here by your wallet provider to view the
            details of your transaction. This page, called the
            <Link
              className="text-green-500 dark:text-green-250 cursor-pointer mx-1"
              href={'/txns'}
            >
              Transaction Details
            </Link>
            page, serves as proof of payment or receipt, especially if
            you&apos;re receiving funds.
          </span>
        ),
        title: 'Why am I here?',
      },
    ],
    Transactions: [
      {
        description:
          'No, NearBlocks does not hold or manage any funds. It is a blockchain explorer that provides detailed information about your transactions and wallet activity.',
        title: 'Does NearBlocks hold my funds?',
      },
      {
        description:
          'NearBlocks shows publicly available information from the Near blockchain, this includes funds in your wallet, transaction history, and contract interactions. This allows you to easily track and verify your blockchain activities.',
        title: 'Why can I see my funds on NearBlocks?',
      },
      {
        description:
          "Once a blockchain transaction is complete, it cannot be undone. If tokens were sent to the wrong address, they cannot be recovered. Only the owner of the receiving address can refund the tokens. If you do not know who owns that address, unfortunately, you won't be able to retrieve the funds.",
        title: 'Can I recover funds sent to the wrong address?',
      },
      {
        description:
          "If your transaction is marked as successful but you don't see the tokens in your wallet, it might be because your wallet doesn't support the specific token or network. Reach out to your wallet service provider for help in resolving the issue and confirming the transaction.",
        title:
          'Why does my transaction show as successful but my tokens are missing?',
      },
      {
        description:
          'Even if a transaction fails, gas fees are still charged. This is because validators on the NEAR network have to process and validate the transaction, regardless of its outcome. The fee covers the computational resources used during this process.',
        title: 'Why was I charged gas fee for a failed transaction?',
      },
      {
        description:
          "We're sorry to hear you've been scammed. Unfortunately, because blockchain transactions are irreversible, we can't cancel or recover lost funds. Once a transaction is completed, it cannot be undone.",
        title: "I've been scammed. Can NearBlocks help me recover my funds?",
      },
      {
        description:
          "Unfortunately, we can't help with recovering funds sent to an unsupported network. To avoid losing assets, make sure to check which networks are supported by the recipient's platform before sending. We recommend reaching out to the support team of the recipient's exchange or wallet, as they have the expertise and resources to assist you.",
        title:
          "I sent funds to a network that my wallet doesn't support. Can you help me recover them?",
      },
      {
        description: (
          <span>
            We understand that receiving spam tokens can be frustrating.
            Unfortunately, NearBlocks cannot remove or block these tokens due to
            the nature of blockchain technology. However, you can report the
            issue to us
            <a
              className="text-green-500 dark:text-green-250 cursor-pointer ml-1"
              href={'https://github.com/Nearblocks/spam-token-list'}
              rel="noopener noreferrer"
              target="_blank"
            >
              here
            </a>
            , and we will flag the tokens and addresses involved to help prevent
            further issues.
          </span>
        ),
        title: 'What can I do if I receive spam tokens?',
      },
    ],
  };
  return (
    <div className="col-span-6 ">
      <div className="mt-8">
        <label className=" text-neargray-600 dark:text-neargray-10 text-sm font-semibold">
          Subject
        </label>
        <div className="flex w-full h-10 mt-2 mb-2 ">
          <span className="relative md:flex overflow-hidden">
            <select
              className="w-96 max-w-full h-full block text-sm px-3 truncate rounded-md border bg-white dark:bg-black-600 dark:border-black-200 cursor-pointer focus:outline-none appearance-none text-neargray-600 dark:text-neargray-10"
              name="Please Select Your Message Subject"
              onChange={handleChange}
              value={selectedValue}
            >
              <option value="0">Please Select Your Message Subject </option>
              <optgroup label="1. Inquiries">
                <option value="1">1.a. General Inquiry</option>
              </optgroup>
              <option value="2">2. API Support</option>
              <option value="3">3. Advertising</option>
              <option value="4">4. Issue / Fix / Bug</option>
              <option value="5">5. Feature Request</option>
              <option value="6">6. Legacy Token Request</option>
            </select>
            <ArrowDown className="absolute right-3 top-3.5 w-4 h-4 bg-white dark:bg-black-600 fill-current text-nearblue-600 dark:text-neargray-10 pointer-events-none" />
          </span>
        </div>
        {selectedValue === '0' && (
          <div className=" text-neargray-600 dark:text-neargray-10">
            <span className="font-semibold text-sm">Note:</span>
            <span className="text-sm ml-1">
              Selecting an incorrect subject could result in a delayed or non
              response. Only inquiries in english will be responded to.
            </span>
          </div>
        )}
      </div>
      {selectedValue === '1' && isOpen && (
        <AccordionRoot collapsible>
          <div className="text-sm font-semibold text-neargray-600 dark:text-neargray-10 mt-4 mb-1">
            Introduction
          </div>
          <div className="border dark:border-black-200 rounded-lg">
            {accordionData.Introduction.map((item, index) => (
              <Items
                className={
                  accordionData.Introduction.length - 1 !== index
                    ? 'dark:border-black-200 border-b'
                    : ''
                }
                description={item.description}
                index={index}
                key={item.title}
                title={item.title}
              />
            ))}
          </div>
          <div className="text-sm font-semibold text-neargray-600 dark:text-neargray-10 mt-4 mb-1">
            Transactions
          </div>
          <div className="border dark:border-black-200 rounded-lg">
            {accordionData.Transactions.map((item, index) => (
              <Items
                className={
                  accordionData.Transactions.length - 1 !== index
                    ? 'dark:border-black-200 border-b'
                    : ''
                }
                description={item.description}
                index={index + accordionData.Introduction.length}
                key={item.title}
                title={item.title}
              />
            ))}
          </div>
          <div className="text-sm font-semibold text-neargray-600 dark:text-neargray-10 mt-4 mb-1">
            Features & Services
          </div>
          <div className="border dark:border-black-200 rounded-lg">
            {accordionData.featuresAndServices.map((item, index) => (
              <Items
                className={
                  accordionData.featuresAndServices.length - 1 !== index
                    ? 'dark:border-black-200 border-b'
                    : ''
                }
                description={item.description}
                index={
                  index +
                  accordionData.Introduction.length +
                  accordionData.Transactions.length +
                  accordionData.featuresAndServices.length -
                  1
                }
                key={item.title}
                title={item.title}
              />
            ))}
          </div>
          <div className="text-sm font-semibold text-neargray-600 dark:text-neargray-10 mt-4 mb-1">
            Additional Support
          </div>
          <div className="border dark:border-black-200 rounded-lg">
            <Items
              description={
                <div>
                  <span>
                    For inquiries about partnerships and press, please contact
                    us
                  </span>
                  <span
                    className="text-green-500 dark:text-green-250 cursor-pointer ml-1"
                    onClick={() => handleContactClick()}
                  >
                    here
                  </span>
                  .
                </div>
              }
              index={45}
              title={' Where can I go and ask additional questions?'}
            />
          </div>
        </AccordionRoot>
      )}
      {showFormContact && <FormContact getContactDetails={getContactDetails} />}
      {selectedValue === '2' && (
        <FormContact getContactDetails={getContactDetails} selectValue="API" />
      )}
      {selectedValue === '3' && (
        <FormContact
          getContactDetails={getContactDetails}
          selectValue="Advertising"
        />
      )}
    </div>
  );
};

export default ContactActions;
