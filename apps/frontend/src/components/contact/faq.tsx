'use client';

import { useLocale } from '@/hooks/use-locale';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/accordion';
import { Button } from '@/ui/button';

import { Link } from '../link';

type Props = {
  onContactClick: () => void;
};

export const ContactFaq = ({ onContactClick }: Props) => {
  const { t } = useLocale('contact');

  const sections = [
    {
      items: [
        {
          answer: t('faq.introduction.whatIs.answer'),
          question: t('faq.introduction.whatIs.question'),
        },
        {
          answer: t('faq.introduction.offers.answer'),
          question: t('faq.introduction.offers.question'),
        },
        {
          answer: t('faq.introduction.cantDo.answer'),
          question: t('faq.introduction.cantDo.question'),
        },
        {
          answer: (
            <>
              {t('faq.introduction.whyHere.answer1')}{' '}
              <Link className="text-link" href="/txns">
                {t('faq.introduction.whyHere.linkText')}
              </Link>{' '}
              {t('faq.introduction.whyHere.answer2')}
            </>
          ),
          question: t('faq.introduction.whyHere.question'),
        },
      ],
      title: t('faq.introduction.title'),
    },
    {
      items: [
        {
          answer: t('faq.transactions.holdFunds.answer'),
          question: t('faq.transactions.holdFunds.question'),
        },
        {
          answer: t('faq.transactions.seeFunds.answer'),
          question: t('faq.transactions.seeFunds.question'),
        },
        {
          answer: t('faq.transactions.recoverFunds.answer'),
          question: t('faq.transactions.recoverFunds.question'),
        },
        {
          answer: t('faq.transactions.successMissing.answer'),
          question: t('faq.transactions.successMissing.question'),
        },
        {
          answer: t('faq.transactions.chargedGas.answer'),
          question: t('faq.transactions.chargedGas.question'),
        },
        {
          answer: t('faq.transactions.scammed.answer'),
          question: t('faq.transactions.scammed.question'),
        },
        {
          answer: t('faq.transactions.unsupportedNetwork.answer'),
          question: t('faq.transactions.unsupportedNetwork.question'),
        },
        {
          answer: (
            <>
              {t('faq.transactions.spamTokens.answer1')}{' '}
              <a
                className="text-link"
                href="https://github.com/Nearblocks/spam-token-list"
                rel="noopener noreferrer"
                target="_blank"
              >
                {t('faq.transactions.spamTokens.here')}
              </a>
              {t('faq.transactions.spamTokens.answer2')}
            </>
          ),
          question: t('faq.transactions.spamTokens.question'),
        },
      ],
      title: t('faq.transactions.title'),
    },
    {
      items: [
        {
          answer: (
            <>
              {t('faq.features.whatCanDo.answer1')}{' '}
              <Link className="text-link" href="/apis">
                {t('faq.features.whatCanDo.api')}
              </Link>{' '}
              {t('faq.features.whatCanDo.answer2')}
            </>
          ),
          question: t('faq.features.whatCanDo.question'),
        },
        {
          answer: t('faq.features.needAccount.answer'),
          question: t('faq.features.needAccount.question'),
        },
        {
          answer: (
            <>
              {t('faq.features.bugReport.answer1')}{' '}
              <a
                className="text-link"
                href="https://github.com/Nearblocks/nearblocks/issues"
                rel="noopener noreferrer"
                target="_blank"
              >
                {t('faq.features.bugReport.here')}
              </a>
              .
            </>
          ),
          question: t('faq.features.bugReport.question'),
        },
      ],
      title: t('faq.features.title'),
    },
    {
      items: [
        {
          answer: (
            <>
              {t('faq.additionalSupport.moreQuestions.answer1')}{' '}
              <Button className="px-0" onClick={onContactClick} variant="link">
                {t('faq.additionalSupport.moreQuestions.here')}
              </Button>
              .
            </>
          ),
          question: t('faq.additionalSupport.moreQuestions.question'),
        },
      ],
      title: t('faq.additionalSupport.title'),
    },
  ];

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
