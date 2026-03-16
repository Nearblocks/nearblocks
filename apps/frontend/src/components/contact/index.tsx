'use client';

import { useRouter, useSearchParams } from 'next/navigation';

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

const subjects = [
  { label: '1. General Inquiry', value: '1' },
  { label: '2. API Support', value: '2' },
  { label: '3. Advertising', value: '3' },
  { label: '4. Issue / Fix / Bug', value: '4' },
  { label: '5. Feature Request', value: '5' },
  { label: '6. Legacy Token Request', value: '6' },
];

export const Contact = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') ?? '';

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
        <h1 className="text-headline-2xl mb-6">Contact NearBlocks</h1>
        <div className="bg-blue-background text-blue-foreground text-body-sm mb-10 rounded p-4">
          <p className="mb-3">Drop us a message, but please be aware that:</p>
          <ul className="flex flex-col gap-4 pl-5">
            <li>
              <p className="font-medium">1. Refund Transaction</p>
              <p className="mt-1 font-normal opacity-80">
                We do not process transactions and are therefore unable to
                revert, refund, expedite, cancel or replace them.
              </p>
            </li>
            <li>
              <p className="font-medium">2. Near Protocol Block Explorer</p>
              <p className="mt-1 font-normal opacity-80">
                NearBlocks is an independent block explorer unrelated to other
                service providers (unless stated explicitly otherwise) and is
                therefore unable to provide a precise response for inquiries
                that are specific to other service providers.
              </p>
            </li>
            <li>
              <p className="font-medium">
                3. Wallet / Exchange / Project related issues
              </p>
              <p className="mt-1 font-normal opacity-80">
                Kindly reach out to your wallet service provider, exchanges or
                project/contract owner for further support as they are in a
                better position to assist you on the issues related to and from
                their platforms.
              </p>
            </li>
          </ul>
          <p className="mt-4">
            Near community support can be found here{' '}
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
          <p className="text-headline-sm mb-2">Subject</p>
          <Select onValueChange={handleSubjectChange} value={subject}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Please Select Your Message Subject" />
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
            <span className="text-foreground font-medium">Note:</span> Selecting
            an incorrect subject could result in a delayed or non response. Only
            inquiries in english will be responded to.
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
