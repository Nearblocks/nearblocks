'use client';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoadingCircular from '@/components/common/LoadingCircular';
import { useConfig } from '@/hooks/app/useConfig';

import ArrowDown from '../Icons/ArrowDown';

interface Props {
  getContactDetails: any;
  selectValue?: string;
}

const FormContact = ({ getContactDetails, selectValue }: Props) => {
  const { theme } = useTheme();
  const t = useTranslations('contact');
  const { siteKey } = useConfig();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('3');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [token, setToken] = useState<string>();
  const turnstileRef = useRef<TurnstileInstance>(null);

  useEffect(() => {
    if (selectValue) {
      setSubject(selectValue);
    }
  }, [selectValue]);

  const submitForm = async (event: any) => {
    event.preventDefault();
    const subjectText = subject === '3' ? 'Partnership / Press' : subject;

    if (status != 'solved' || !token) {
      setStatus('error');
      return;
    }

    try {
      setLoading(true);
      const contactDetails = {
        description: description,
        email: email,
        name: name,
        subject: subjectText,
        token: token,
      };
      const response = await getContactDetails(contactDetails);
      if (!response) {
        throw new Error('Network response was not ok');
      } else {
        setName('');
        setEmail('');
        setDescription('');
        setStatus(null);
        setToken('');
        toast.success('Thank you!');
      }
    } catch (err) {
      console.log(err);
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitForm}>
      <div className="flex flex-col gap-4 mt-4 rounded-md ">
        <div>
          <p className="font-semibold text-sm mb-1">{t('form.name.label')}</p>
          <input
            autoComplete="off"
            className="px-3 py-1.5 bg-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-sm  w-full h-10"
            id="name"
            onChange={(e) => setName(e?.target?.value)}
            placeholder="Enter name..."
            required
            value={name}
          />
        </div>
        <div>
          <p className="font-semibold text-sm mb-1">{t('form.email.label')}</p>
          <input
            autoComplete="off"
            className="px-3 py-1.5 bg-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-sm w-full h-10"
            id="email"
            onChange={(e) => setEmail(e?.target?.value)}
            placeholder="Enter email..."
            required
            type="email"
            value={email}
          />
        </div>
        {!selectValue && (
          <div>
            <p className="font-semibold text-sm mb-1">
              {t('form.subject.label')}
            </p>
            <label className="relative md:flex">
              <select
                className="px-3 py-1.5 bg-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} w-full rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-sm appearance-none h-10"
                onChange={(e) => setSubject(e?.target?.value)}
                value={subject}
              >
                <option disabled={true} selected>
                  Select subject
                </option>
                <option value="3">Partnership / Press</option>
              </select>
              <ArrowDown className="absolute right-2 top-3 w-4 h-4 fill-current text-gray-500 pointer-events-none" />
            </label>
          </div>
        )}
        <div>
          <p className="font-semibold text-sm mb-1">
            {t('form.message.label')}
          </p>
          <textarea
            autoComplete="off"
            className="px-3 py-1.5 bg-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-sm overflow-hidden w-full"
            id="message"
            maxLength={300}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Max characters (300 words)"
            required
            rows={5}
            value={description}
          />
        </div>
        <div className="flex">
          <Turnstile
            onError={() => {
              setStatus('error');
            }}
            onExpire={() => {
              setStatus('expired');
              setToken('');
            }}
            onSuccess={(token) => {
              setToken(token);
              setStatus('solved');
            }}
            options={{
              appearance: 'always',
              refreshExpired: 'auto',
              size: 'normal',
              theme: theme as any,
            }}
            ref={turnstileRef}
            siteKey={siteKey as string}
          />
          {status === 'error' && (
            <span className="text-red-500 text-sm p-6">
              * Please verify the captcha
            </span>
          )}
        </div>
        <button
          className="text-base text-white border border-green-900/10 font-normal px-3 py-1.5 bg-green-500 dark:bg-green-250 dark:text-neargray-10  hover:bg-green-400 rounded w-fit"
          disabled={loading}
          type="submit"
        >
          {loading ? <LoadingCircular /> : t('form.button')}
        </button>
      </div>
    </form>
  );
};

export default FormContact;
