'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/accordion';
import { Button } from '@/ui/button';

import { Link } from '../link';

type FaqItem = {
  answer: React.ReactNode;
  question: string;
};

type FaqSection = {
  items: FaqItem[];
  title: string;
};

const getSections = (onContactClick: () => void): FaqSection[] => [
  {
    items: [
      {
        answer:
          'NearBlocks is an easy-to-use blockchain explorer and analytics platform for the Near Protocol.',
        question: 'What is NearBlocks?',
      },
      {
        answer:
          'NearBlocks makes it easy to access and understand blockchain data on the NEAR network. With NearBlocks, you can view transactions, review wallet histories, interact with smart contracts, and more.',
        question: 'What does NearBlocks offer?',
      },
      {
        answer:
          "NearBlocks doesn't process transactions, move assets between wallets, recover lost funds, or access your private keys. We're not a wallet or exchange service, so we can't reverse transactions or retrieve lost assets.",
        question: "What NearBlocks can't do?",
      },
      {
        answer: (
          <>
            You were likely sent here by your wallet provider to view the
            details of your transaction. This page, called the{' '}
            <Link className="text-link" href="/txns">
              Transaction Details
            </Link>{' '}
            page, serves as proof of payment or receipt, especially if
            you&apos;re receiving funds.
          </>
        ),
        question: 'Why am I here?',
      },
    ],
    title: 'Introduction',
  },
  {
    items: [
      {
        answer:
          'No, NearBlocks does not hold or manage any funds. It is a blockchain explorer that provides detailed information about your transactions and wallet activity.',
        question: 'Does NearBlocks hold my funds?',
      },
      {
        answer:
          'NearBlocks shows publicly available information from the Near blockchain, this includes funds in your wallet, transaction history, and contract interactions. This allows you to easily track and verify your blockchain activities.',
        question: 'Why can I see my funds on NearBlocks?',
      },
      {
        answer:
          "Once a blockchain transaction is complete, it cannot be undone. If tokens were sent to the wrong address, they cannot be recovered. Only the owner of the receiving address can refund the tokens. If you do not know who owns that address, unfortunately, you won't be able to retrieve the funds.",
        question: 'Can I recover funds sent to the wrong address?',
      },
      {
        answer:
          "If your transaction is marked as successful but you don't see the tokens in your wallet, it might be because your wallet doesn't support the specific token or network. Reach out to your wallet service provider for help in resolving the issue and confirming the transaction.",
        question:
          'Why does my transaction show as successful but my tokens are missing?',
      },
      {
        answer:
          'Even if a transaction fails, gas fees are still charged. This is because validators on the NEAR network have to process and validate the transaction, regardless of its outcome. The fee covers the computational resources used during this process.',
        question: 'Why was I charged a gas fee for a failed transaction?',
      },
      {
        answer:
          "We're sorry to hear you've been scammed. Unfortunately, because blockchain transactions are irreversible, we can't cancel or recover lost funds. Once a transaction is completed, it cannot be undone.",
        question: "I've been scammed. Can NearBlocks help me recover my funds?",
      },
      {
        answer:
          "Unfortunately, we can't help with recovering funds sent to an unsupported network. To avoid losing assets, make sure to check which networks are supported by the recipient's platform before sending. We recommend reaching out to the support team of the recipient's exchange or wallet, as they have the expertise and resources to assist you.",
        question:
          "I sent funds to a network that my wallet doesn't support. Can you help me recover them?",
      },
      {
        answer: (
          <>
            We understand that receiving spam tokens can be frustrating.
            Unfortunately, NearBlocks cannot remove or block these tokens due to
            the nature of blockchain technology. However, you can report the
            issue to us{' '}
            <a
              className="text-link"
              href="https://github.com/Nearblocks/spam-token-list"
              rel="noopener noreferrer"
              target="_blank"
            >
              here
            </a>
            , and we will flag the tokens and addresses involved to help prevent
            further issues.
          </>
        ),
        question: 'What can I do if I receive spam tokens?',
      },
    ],
    title: 'Transactions',
  },
  {
    items: [
      {
        answer: (
          <>
            NearBlocks lets you easily look up transactions, check smart
            contracts, explore charts and stats, and the latest updates on the
            NEAR blockchain. Developers can also use our{' '}
            <Link className="text-link" href="/apis">
              API
            </Link>{' '}
            services to build apps or gather blockchain data.
          </>
        ),
        question: 'What can I do on NearBlocks?',
      },
      {
        answer:
          'You can access most features on NearBlocks without signing in. However, some exclusive features, like commenting, require signing in with your wallet.',
        question: 'Do I need an account to use NearBlocks?',
      },
      {
        answer: (
          <>
            If you encounter a bug, please report it{' '}
            <a
              className="text-link"
              href="https://github.com/Nearblocks/nearblocks/issues"
              rel="noopener noreferrer"
              target="_blank"
            >
              here
            </a>
            .
          </>
        ),
        question: 'How can I report a bug on NearBlocks?',
      },
    ],
    title: 'Features & Services',
  },
  {
    items: [
      {
        answer: (
          <>
            For inquiries about partnerships and press, please contact us{' '}
            <Button className="px-0" onClick={onContactClick} variant="link">
              here
            </Button>
            .
          </>
        ),
        question: 'Where can I go and ask additional questions?',
      },
    ],
    title: 'Additional Support',
  },
];

type Props = {
  onContactClick: () => void;
};

export const ContactFaq = ({ onContactClick }: Props) => {
  const sections = getSections(onContactClick);

  return (
    <div className="mt-6">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-headline-sm mt-6 mb-3">{section.title}</h3>
          <Accordion className="flex flex-col gap-2" type="multiple">
            {section.items.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground px-3">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
};
