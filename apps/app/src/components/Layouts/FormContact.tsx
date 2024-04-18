import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import ArrowDown from '../Icons/ArrowDown';
import LoadingCircular from '../common/LoadingCircular';

const FormContact = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const submitForm = async (event: any) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          description,
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitForm}>
      <p className="text-lg text-black dark:text-neargray-10 font-medium sm:mt-0 mt-10">
        {t(`Contact Form:`)}
      </p>
      <div className="mt-10 flex flex-col gap-4">
        <p className="font-semibold text-base">{t('Name')}</p>
        <input
          id="name"
          placeholder="Enter name..."
          autoComplete="off"
          className="px-3 py-1.5 bg-white dark:bg-black-600 dark:border-black-200   border border-{#E5E7EB} rounded outline-blue text-base"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
        />
        <p className="font-semibold text-base">{t('Email')}</p>
        <input
          id="email"
          type="email"
          placeholder="Enter email..."
          autoComplete="off"
          className="px-3 py-1.5 bg-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} rounded outline-blue text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="font-semibold text-base">{t('Subject')}</p>
        <label className="relative md:flex">
          <select
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} w-full rounded outline-blue text-base appearance-none"
          >
            <option selected disabled={true}>
              Select subject
            </option>
            <option value="Advertising">Advertising</option>
            <option value="Partnership / Press">Partnership / Press </option>
            <option value="Feature Request">Feature Request</option>
            <option value="Issue / Fix / Bug">Issue / Fix / Bug</option>
            <option value="API">API</option>
          </select>
          <ArrowDown className="absolute right-2 top-3 w-4 h-4 fill-current text-gray-500 pointer-events-none" />
        </label>

        <p className="font-semibold text-base mt-2">{t('Message')}</p>
        <textarea
          id="message"
          placeholder="Max characters (300 words)"
          autoComplete="off"
          className="px-3 py-1.5 bg-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} rounded outline-blue text-base overflow-hidden"
          maxLength={300}
          rows={5}
          onChange={(e) => setDescription(e.target.value)}
          defaultValue={description}
          required
        />
        <button
          type="submit"
          className="text-lg text-white border border-green-900/10 font-normal px-3 py-1.5 bg-green-500 dark:bg-green-250 dark:text-neargray-10  hover:bg-green-400 rounded w-fit"
        >
          {loading ? <LoadingCircular /> : t('Send Message')}
        </button>
      </div>
    </form>
  );
};

export default FormContact;
