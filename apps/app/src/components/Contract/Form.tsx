import 'react-tabs/style/react-tabs.css';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import { fetcher, poster } from '@/hooks/useFetch';
import LoadingCircular from '@/components/common/LoadingCircular';
import DetailsForm from '@/components/Contract/DetailsForm';
import FaArrowLeft from '../Icons/FaArrowLeft';
import FaCheckCircle from '../Icons/FaCheckCircle';
import FaTimesCircle from '../Icons/FaTimesCircle';
// import { isValidAccount } from '@/utils/libs';
import LoadingCircle from '../Icons/LoadingCircle';
import useRpc from '@/hooks/useRpc';

interface UploadedFile {
  name: string;
  size: number;
}

const ContractForm = () => {
  const { t } = useTranslation('contract');
  const router = useRouter();
  const { hash } = router.query;

  const [loading, setLoading] = useState(false);
  // const [compilerType, setCompilerType] = useState<string | null>(null);
  const [isCheckedTerms, setIsCheckedTerms] = useState(false);
  const [errorMessageTerms, setErrorMessageTerms] = useState('');
  const [success, setSuccess] = useState(false);
  const [address, setAddress] = useState('');
  const [apiError, setApiError] = useState(false);
  const [invalidAddressError, setInvalidAddressError] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [status, setStatus] = useState('PENDING');

  const {
    register,
    handleSubmit,
    formState: { errors },
    // getValues,
    setError,
    setValue,
    clearErrors,
    reset,
  } = useForm();

  useEffect(() => {
    if (hash) setValue('address', hash as string);
  }, [hash]);

  const displayCompilerType: Record<string, string> = {
    rust: 'Rust',
    typescript: 'Typescript',
  };

  const { viewAccount } = useRpc();

  // const validateAddress = () => {
  //   const addressValue = getValues('address');
  //   if (!addressValue) {
  //     setError('address', {
  //       type: 'required',
  //       message: t('verify.addressRequired'),
  //     });
  //   } else if (!isValidAccount(addressValue)) {
  //     setError('address', {
  //       type: 'invalid',
  //       message: t('verify.addressInvalid'),
  //     });
  //   }
  // };

  // const validateCompilerType = () => {
  //   if (!getValues('compilerType')) {
  //     setError('compilerType', {
  //       type: 'required',
  //       message: t('verify.compilerTypeRequired'),
  //     });
  //   }
  // };

  // const validateContractZip = () => {
  //   if (!getValues('contractZip')) {
  //     setError('contractZip', {
  //       type: 'required',
  //       message: t('verify.contractZipRequired'),
  //     });
  //   }
  // };

  const clearForm = () => {
    reset();
    // setCompilerType(null);
    setIsCheckedTerms(false);
    setApiError(false);
    resetFileUpload();
    setErrorMessageTerms('');
  };

  const onStart = () => {
    clearForm();
    setApiError(false);
    setSuccess(false);
    setAddress('');
    setStatus('PENDING');
    setInvalidAddressError(false);
  };

  const resetFileUpload = () => {
    setUploadedFiles([]);
    setValue('contractZip', null);
  };

  const pollStatus = async (verificationId: string) => {
    try {
      let currentStatus: string = 'PENDING';

      while (true) {
        const response = await fetcher(`contract/${verificationId}/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        currentStatus = response?.contractVerification[0]?.status;

        setStatus(currentStatus);

        if (currentStatus === 'SUCCESS' || currentStatus === 'FAILURE') {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      setApiError(true);
    }
  };

  const submitForm = async (data: any) => {
    if (!isCheckedTerms) {
      setErrorMessageTerms(t('verify.termsAndServiceRequired'));
      setLoading(false);

      return;
    }

    setLoading(true);

    try {
      const account = await viewAccount(data.address);

      console.log('invalidAddressError', invalidAddressError);
      console.log('account', account);
      if (!account) {
        setInvalidAddressError(true);

        setLoading(false);
        return;
      }

      setAddress(data.address);

      const formData = new FormData();

      formData.append('accountId', data.address);
      formData.append('contractZip', data.contractZip);

      const response = await poster(`contract/verify`, formData);

      if (response?.verificationId) {
        setSuccess(true);
        await pollStatus(response.verificationId);
      } else {
        setApiError(true);
        setSuccess(false);
      }

      clearForm();
    } catch (error) {
      setApiError(true);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-nearblue-600 dark:text-neargray-10 w-full flex flex-col items-center text-center">
        <div className="text-center">
          <p className="text-sm mt-3 text-nearblue-600 dark:text-neargray-10">
            {t('verify.info')}
          </p>
        </div>
      </div>
      <div className="w-full max-w-3xl p-8 bg-white dark:bg-black-600 soft-shadow rounded-xl">
        {success && (
          <div className="flex my-auto text-nearblue-600 dark:text-neargray-10">
            <div className="flex-1 break-all">
              <p className="text-sm whitespace-normal">
                {t('verify.verificationStarted')}
              </p>
              {address && (
                <Link legacyBehavior href={`/address/${address}`}>
                  <a className="text-gray-500 dark:text-neargray-100 hover:text-green-500 dark:hover:text-green-250 hover:no-underline text-sm">
                    [{address}]
                  </a>
                </Link>
              )}
              <div className="flex items-center text-sm whitespace-normal">
                <p className="mr-2">{t('verify.status')}:</p>
                <p className="mr-2">
                  {status === 'PENDING'
                    ? t('verify.status.pending')
                    : status === 'SUCCESS'
                    ? t('verify.status.success')
                    : t('verify.status.failure')}
                </p>
                <div>
                  {status === 'SUCCESS' && <FaCheckCircle />}
                  {status === 'PENDING' && <LoadingCircle />}
                  {status === 'FAILURE' && <FaTimesCircle />}
                </div>
              </div>
            </div>
          </div>
        )}
        {(apiError || invalidAddressError) && (
          <div className="text-nearblue-600 dark:text-neargray-10">
            <div className="flex  my-auto items-center">
              <div className="mx-2">
                <FaTimesCircle />
              </div>
              <div className="break-all">
                <p className="text-sm whitespace-normal break-word">
                  {invalidAddressError
                    ? t('verify.invalidAddressError')
                    : t('verify.error')}
                </p>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(submitForm)}>
          {apiError || success ? (
            <div className="w-full max-w-3xl flex justify-center items-center mt-4 my-auto">
              <button
                type="button"
                onClick={onStart}
                className="text-sm font-normal px-3 py-1.5 hover:bg-green-400 w-fit focus:outline-none rounded-lg bg-green-600 dark:bg-green-250 text-white hover:shadow-md hover:shadow-green-500/50"
              >
                <div className="flex my-auto">
                  <FaArrowLeft />
                  &nbsp;{t('verify.startover')}
                </div>
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-0 ">
                <DetailsForm
                  // setCompilerType={setCompilerType}
                  displayCompilerType={displayCompilerType}
                  setIsCheckedTerms={setIsCheckedTerms}
                  setErrorMessageTerms={setErrorMessageTerms}
                  errorMessageTerms={errorMessageTerms}
                  isCheckedTerms={isCheckedTerms}
                  register={register}
                  setError={setError}
                  errors={errors}
                  clearErrors={clearErrors}
                  setValue={setValue}
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                />
              </div>
              <div className="w-full max-w-3xl flex justify-center items-center mt-4 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    clearForm();
                    setSuccess(false);
                    setAddress('');
                  }}
                  className="text-sm text-nearblue-600 font-normal px-3 py-1.5 focus:outline-none hover:bg-neargray-800 bg-neargray-700 dark:text-neargray-10 dark:bg-black-200 rounded-lg hover:text-nearblue-600 hover:shadow-md"
                >
                  {t('verify.reset')}
                </button>
                <button
                  type="submit"
                  className="text-sm font-normal px-3 py-1.5 hover:bg-green-400 w-fit focus:outline-none rounded-lg bg-green-600 dark:bg-green-250 text-white hover:shadow-md hover:shadow-green-500/50"
                >
                  {loading ? <LoadingCircular /> : t('verify.submit')}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </>
  );
};
export default ContractForm;
