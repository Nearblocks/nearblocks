import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import ArrowDown from '../Icons/ArrowDown';
import LoadingCircular from '../common/LoadingCircular';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Props {
  selectValue?: string;
}

const FormContact = ({ selectValue }: Props) => {
  const { t } = useTranslation('contact');

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Partnership / Press');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (selectValue) {
      setSubject(selectValue);
    }
  }, [selectValue]);

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
      } else {
        setName('');
        setEmail('');
        setDescription('');
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
      <div className="flex flex-col gap-4 mt-5 rounded-md ">
        <p className="font-semibold text-base">{t('form.name.label')}</p>
        <input
          id="name"
          placeholder="Enter name..."
          autoComplete="off"
          className="px-3 py-1.5 bg-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-base"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
        />
        <p className="font-semibold text-base">{t('form.email.label')}</p>
        <input
          id="email"
          type="email"
          placeholder="Enter email..."
          autoComplete="off"
          className="px-3 py-1.5 bg-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {!selectValue && (
          <>
            <p className="font-semibold text-base">{t('form.subject.label')}</p>
            <label className="relative md:flex">
              <select
                onChange={(e) => setSubject(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} w-full rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-base appearance-none"
                value={subject}
              >
                <option selected disabled={true}>
                  Select subject
                </option>
                <option value="Partnership / Press">Partnership / Press</option>
                <option value="Feature Request">Feature Request</option>
              </select>
              <ArrowDown className="absolute right-2 top-3 w-4 h-4 fill-current text-gray-500 pointer-events-none" />
            </label>
          </>
        )}
        <p className="font-semibold text-base mt-2">
          {t('form.message.label')}
        </p>
        <textarea
          id="message"
          placeholder="Max characters (300 words)"
          autoComplete="off"
          className="px-3 py-1.5 bg-white dark:bg-black-600 dark:border-black-200 border border-{#E5E7EB} rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-base overflow-hidden"
          maxLength={300}
          rows={5}
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          required
        />
        <button
          type="submit"
          className="text-lg text-white border border-green-900/10 font-normal px-3 py-1.5 bg-green-500 dark:bg-green-250 dark:text-neargray-10  hover:bg-green-400 rounded w-fit"
          disabled={loading}
        >
          {loading ? <LoadingCircular /> : t('form.button')}
        </button>
      </div>
    </form>
  );
};

export default FormContact;
