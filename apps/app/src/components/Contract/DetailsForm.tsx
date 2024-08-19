import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import Dropzone from 'react-dropzone';
import FileCode from '../Icons/FileCode';

const DetailsForm = ({
  // setCompilerType,
  setIsCheckedTerms,
  setErrorMessageTerms,
  errorMessageTerms,
  isCheckedTerms,
  register,
  setError,
  errors,
  clearErrors,
  setValue,
  uploadedFiles,
  setUploadedFiles,
}: any) => {
  const { t } = useTranslation('contract');

  // const handleCompilerTypeChange = (e: any) => {
  //   setCompilerType(e.target.value);
  // };

  const handleDrop = (acceptedFiles: File[]) => {
    const filesWithSizes = {
      name: acceptedFiles[0].name,
      size: acceptedFiles[0].size,
    };
    setUploadedFiles(filesWithSizes);
    setValue('contractZip', acceptedFiles[0]);

    if (acceptedFiles.length > 0) {
      clearErrors('contractZip');
    }
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCheckedTerms(e.target.checked);

    if (e.target.checked) {
      setErrorMessageTerms(null);
      clearErrors('terms');
    } else {
      setError('terms', {
        type: 'manual',
        message: t('verify.termsRequired'),
      });
    }
  };

  return (
    <>
      <p className="font-semibold text-sm text-nearblue-600 dark:text-neargray-10 my-2">
        {t('verify.enterAddress')}
      </p>
      <input
        id="address"
        placeholder={t('verify.addressPlaceholder')}
        autoComplete="off"
        className="py-1.5 text-sm border dark:border-black-200 px-3 w-full rounded-md h-10  bg-white dark:bg-black-600 dark:text-neargray-10 outline-none"
        {...register('address', {
          required: t('verify.addressRequired'),
          minLength: {
            value: 2,
            message: t('verify.addressInvalid'),
          },
          maxLength: {
            value: 42,
            message: t('verify.addressInvalid'),
          },
          pattern: {
            value: /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/,
            message: t('verify.addressInvalid'),
          },
        })}
      />
      {errors?.address && (
        <p className="text-red-500 text-xs my-1">{errors?.address?.message}</p>
      )}
      {/* <p className="font-semibold text-sm text-nearblue-600 dark:text-neargray-10 my-2">
        {t('verify.selectCompilerType')}
      </p>
      <label className="relative md:flex">
        <select
          id="compilerType"
          {...register('compilerType', {
            required: t('verify.compilerTypeRequired'),
          })}
          onChange={handleCompilerTypeChange}
          className="px-3 py-1.5 appearance-none text-sm border dark:border-black-200 w-full rounded-md h-10  bg-white dark:bg-black-600 dark:text-neargray-10 outline-none"
        >
          <option value="" disabled>
            {t('verify.pleaseSelect')}
          </option>
          {Object.entries(displayCompilerType).map(([key, value]: any) => (
            <option value={key} key={key} disabled={key !== 'rust'}>
              {value}
            </option>
          ))}
        </select>

        <ArrowDown className="absolute right-2 top-3 w-4 h-4 fill-current dark:text-neargray-10 pointer-events-none" />
      </label>
      {errors?.compilerType && (
        <p className="text-red-500 text-xs my-1">
          {errors?.compilerType?.message}
        </p>
      )} */}
      <div>
        <Dropzone
          onDrop={handleDrop}
          multiple={false}
          accept={{
            'application/zip': ['.zip'],
          }}
          {...register('contractZip', {
            required: t('verify.contractZipRequired'),
          })}
        >
          {({ getRootProps, getInputProps }) => (
            <>
              <p className="font-semibold text-sm text-nearblue-600 dark:text-neargray-10 my-3">
                {t('verify.selectZipFile')}
              </p>
              <div
                {...getRootProps()}
                className="flex justify-center items-center rounded-md cursor-pointer h-32 w-full text-gray-darker text-sm font-bold border-dashed border-2 border-gray-200 outline-none"
              >
                <div className="flex-col justify-center">
                  <input {...getInputProps()} name="contractZip" />
                  <div className="text-center text-nearblue-600 dark:text-neargray-10 text-xs">
                    <span className="mx-auto flex justify-center my-2">
                      <FileCode className="w-6 h-6" />
                    </span>
                    <div className="text-xs text-gray-400 my-1">
                      {t('verify.supportedTypes', {
                        extension: '.zip',
                      })}
                    </div>
                    {t('verify.uploadFile')}
                  </div>
                </div>
              </div>
            </>
          )}
        </Dropzone>
        {errors?.contractZip && (
          <p className="text-red-500 text-xs my-1">
            {errors?.contractZip?.message}
          </p>
        )}
        <p className=" text-nearblue-600 dark:text-neargray-10 text-xs my-1 flex justify-center">
          {uploadedFiles.name
            ? `${uploadedFiles.name} (${uploadedFiles.size} Bytes)`
            : ''}
        </p>
      </div>
      <div className="text-nearblue-600 dark:text-neargray-10 text-sm flex items-center my-2">
        <input
          type="checkbox"
          id="agreeCheckbox"
          className="mr-2 my-1 cursor-pointer"
          onChange={handleTermsChange}
          checked={isCheckedTerms}
        />
        {t('verify.iAgree')}{' '}
        <Link
          href="/terms-and-conditions"
          className="text-gray-500 dark:text-neargray-100 hover:text-green-500 dark:hover:text-green-250 ml-1"
        >
          {t('verify.termsOfService')}
        </Link>
      </div>
      {errorMessageTerms && (
        <p className="text-red-500 text-xs my-1">{errorMessageTerms}</p>
      )}
    </>
  );
};

export default DetailsForm;
