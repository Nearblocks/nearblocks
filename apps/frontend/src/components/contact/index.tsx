'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useLocale } from '@/hooks/use-locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';

import { ContactFaq } from './faq';
import { ContactForm } from './form';

const BUG_REPORT =
  'https://github.com/Nearblocks/nearblocks/issues/new?template=bug_report.md';
const FEATURE_REQUEST =
  'https://github.com/Nearblocks/nearblocks/issues/new?template=feature_request.md';
const TOKEN_REQUEST =
  'https://github.com/Nearblocks/nearblocks/issues/new?template=token_request.md';

export const Contact = () => {
  const { t } = useLocale('contact');
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') ?? '';

  const subjects = [
    { label: t('subjects.generalInquiry'), value: '1' },
    { label: t('subjects.apiSupport'), value: '2' },
    { label: t('subjects.advertising'), value: '3' },
    { label: t('subjects.bug'), value: '4' },
    { label: t('subjects.feature'), value: '5' },
    { label: t('subjects.tokenRequest'), value: '6' },
  ];

  const handleSubjectChange = (value: string) => {
    if (value === '4') {
      window.location.href = BUG_REPORT;
      return;
    }
    if (value === '5') {
      window.location.href = FEATURE_REQUEST;
      return;
    }
    if (value === '6') {
      window.location.href = TOKEN_REQUEST;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('subject', value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const setSubject = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('subject', value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-headline-2xl mb-6">{t('heading')}</h1>
        <div className="bg-blue-background text-blue-foreground text-body-sm mb-10 rounded p-4">
          <p className="mb-3">{t('disclaimer.heading')}</p>
          <ul className="flex flex-col gap-4 pl-5">
            <li>
              <p className="font-medium">{t('disclaimer.item1Heading')}</p>
              <p className="mt-1 font-normal opacity-80">
                {t('disclaimer.item1Body')}
              </p>
            </li>
            <li>
              <p className="font-medium">{t('disclaimer.item2Heading')}</p>
              <p className="mt-1 font-normal opacity-80">
                {t('disclaimer.item2Body')}
              </p>
            </li>
            <li>
              <p className="font-medium">{t('disclaimer.item3Heading')}</p>
              <p className="mt-1 font-normal opacity-80">
                {t('disclaimer.item3Body')}
              </p>
            </li>
          </ul>
          <p className="mt-4">
            {t('disclaimer.community')}{' '}
            <a
              className="text-link underline underline-offset-4"
              href="https://dev.near.org"
              rel="noopener noreferrer"
              target="_blank"
            >
              https://dev.near.org
            </a>
          </p>
        </div>

        <div className="mb-4">
          <p className="text-headline-sm mb-2">{t('subjectLabel')}</p>
          <Select onValueChange={handleSubjectChange} value={subject}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder={t('subjectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-body-sm mt-2">
            <span className="text-foreground font-medium">{t('note')}</span>{' '}
            {t('noteText')}
          </p>
        </div>

        {subject === '1' && (
          <ContactFaq onContactClick={() => setSubject('2')} />
        )}
        {(subject === '2' || subject === '3') && (
          <ContactForm
            subject={
              subjects.find((s) => s.value === subject)?.label ?? subject
            }
          />
        )}
      </div>
    </div>
  );
};
