/* eslint-disable @next/next/no-img-element */
import { FormikValues, useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DialogRoot, DialogTrigger } from '@/components/ui/dialog';
import { catchErrors } from '@/utils/app/libs';
import { textCampaignValidation } from '@/utils/app/validationSchema';
import { CampaignProps } from '@/utils/types';

import Avatar from '@/components/app/Icons/Avatar';
import EmailCircle from '@/components/app/Icons/EmailCircle';
import LoginCircle from '@/components/app/Icons/LoginCircle';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import PreviewAd from '@/components/app/Campaign/PreviewAd';
import StartForm from '@/components/app/Campaign/StartForm';
import { request } from '@/hooks/app/useAuth';
import { useConfig } from '@/hooks/app/useConfig';

const TextAdForm = ({
  campaignData,
  campaignId,
  campaignMutate,
  loading,
}: CampaignProps) => {
  const validationSchema = textCampaignValidation(campaignData);

  const [isSubscriptionCancelled, setIsSubscriptionCancelled] = useState(false);
  const [icon, setIcon] = useState<object>();
  const [iconPreview, setIconPreview] = useState<{ icon?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userApiURL: baseURL } = useConfig();

  useEffect(() => {
    if (campaignData?.data?.subscription?.status === 'canceled') {
      setIsSubscriptionCancelled(true);
    } else {
      setIsSubscriptionCancelled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignData?.data?.subscription?.status]);

  useEffect(() => {
    if (campaignId && campaignData) {
      const iconUrl = campaignData?.data?.icon
        ? `${campaignData?.data?.icon}`
        : null;
      if (iconUrl) {
        formik.setFieldValue('icon', iconUrl);
        setIconPreview({
          icon: iconUrl,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, campaignData]);

  const onSubmit = async (values: FormikValues) => {
    const formData = new FormData();
    formData.append('is_active', '0');

    formData.append('text', values?.text);
    formData.append('site_name', values?.site_name);
    formData.append('link_name', values?.link_name);
    formData.append('url', values?.url);
    // Only append images if it's a File (indicating it has been changed)
    if (values?.icon instanceof File) {
      formData.append('icon', values?.icon);
    }
    setIsSubmitting(true);
    try {
      await request(baseURL).post(`/campaigns/${campaignId}/text-ad`, formData);
      if (!toast.isActive('campaign-updated')) {
        toast.success('Campaign Information updated', {
          toastId: 'campaign-updated',
        });
      }
      setIsSubmitting(false);
      campaignMutate();
    } catch (error: any) {
      const message = catchErrors(error);
      if (!toast.isActive('campaign-update')) {
        toast.error(message, {
          toastId: 'campaign-update-error',
        });
      }
      setIsSubmitting(false);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldTouched('icon', true, false);
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setIcon({ ...icon, icon: e.target.files[0] });
      setIconPreview({ ...iconPreview, icon: url });
      formik.setFieldValue('icon', e.target.files[0]);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      icon: campaignData?.data?.icon || null,
      link_name: campaignData?.data?.link_name || '',
      site_name: campaignData?.data?.site_name || '',
      text: campaignData?.data?.text || '',
      url: campaignData?.data?.url || '',
    },
    onSubmit,
    validateOnBlur: true,
    validateOnChange: true,
    validationSchema,
  });

  return (
    <>
      <div className="rounded-xl border dark:border-black-200 bg-white dark:bg-black-600 soft-shadow">
        <div className="px-5 py-5 border-b dark:border-black-200">
          <p className="text-base text-nearblue-600 dark:text-neargray-10">
            Campaign Information
          </p>
        </div>
        <p className="text-sm text-gray-600 dark:text-neargray-10 mt-2 px-6 py-4">
          Edit the below campaign informations
        </p>
        <div>
          <div className="gap-1 items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
              <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center">
                <Avatar /> <span className="ml-2">Placement</span>
              </p>
              {loading ? (
                <div className="w-full  md:w-1/5">
                  <Skeleton className="flex w-36 h-4" />
                </div>
              ) : (
                <p className="text-sm text-nearblue-600 dark:text-neargray-10 font-semibold">
                  {campaignData?.data?.title}
                </p>
              )}
            </div>
          </div>
          {campaignData?.data?.start_date && (
            <div className="gap-1 items-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
                <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center">
                  <LoginCircle /> <span className="ml-2">Start Date</span>
                </p>
                {loading ? (
                  <div className="w-full  md:w-1/5">
                    <Skeleton className="flex w-36 h-4" />
                  </div>
                ) : (
                  <p className="text-sm text-nearblue-600 dark:text-neargray-10 font-semibold">
                    {`${campaignData?.data?.start_date.slice(0, 19)} (UTC)`}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
            <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center">
              <EmailCircle /> <span className="ml-2">URL</span>
            </p>
            {loading ? (
              <div className="col-span-2">
                <Skeleton className="flex h-6" />
              </div>
            ) : (
              <div className="flex flex-col items-start col-span-2">
                <input
                  autoComplete="off"
                  className="w-full border px-3 py-2 dark:text-neargray-10 text-sm bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800"
                  disabled={isSubscriptionCancelled}
                  name="url"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.url}
                />

                {formik?.touched?.url && formik?.errors?.url && (
                  <small className="text-red-500 text-center my-1">
                    {formik?.errors?.url}
                  </small>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
            <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center">
              <Avatar /> <span className="ml-2">Enter Site Name</span>
            </p>
            {loading ? (
              <div className="col-span-2">
                <Skeleton className="flex h-6" />
              </div>
            ) : (
              <div className="flex flex-col items-start col-span-2">
                <input
                  className="text-nearblue-600 dark:text-neargray-10 border px-3 py-2 text-sm w-full mt-2 bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800"
                  disabled={isSubscriptionCancelled}
                  id="site_name"
                  name="site_name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik?.values?.site_name}
                />
                {formik?.touched?.site_name && formik?.errors?.site_name && (
                  <small className="text-red-500 text-center  my-1">
                    {formik?.errors?.site_name}
                  </small>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
            <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center">
              <Avatar /> <span className="ml-2">Enter Link Text</span>
            </p>
            {loading ? (
              <div className="col-span-2">
                <Skeleton className="flex h-6" />
              </div>
            ) : (
              <div className="flex flex-col items-start col-span-2">
                <input
                  className="text-nearblue-600 dark:text-neargray-10 border px-3 py-2 text-sm w-full mt-2 bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800"
                  disabled={isSubscriptionCancelled}
                  id="link_name"
                  name="link_name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values?.link_name}
                />
                {formik?.touched?.link_name && formik?.errors?.link_name && (
                  <small className="text-red-500 text-center  my-1">
                    {formik?.errors?.link_name}
                  </small>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
            <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center">
              <Avatar /> <span className="ml-2">Enter Display Text</span>
            </p>
            {loading ? (
              <div className="col-span-2">
                <Skeleton className="flex h-12" />
              </div>
            ) : (
              <div className="flex flex-col items-start col-span-2">
                <textarea
                  autoComplete="off"
                  className="text-nearblue-600 dark:text-neargray-10 border px-3 py-2 text-sm w-full mt-2 bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800"
                  disabled={isSubscriptionCancelled}
                  id="text"
                  name="text"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  rows={3}
                  value={formik?.values?.text}
                />
                {formik?.touched?.text && formik?.errors?.text && (
                  <small className="text-red-500 text-center  my-1">
                    {formik?.errors?.text}
                  </small>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
            <div className="text-gray-600 dark:text-neargray-10 text-sm flex flex-col items-start">
              <div className="flex items-center">
                <Avatar />{' '}
                <span className="ml-2">Upload Icon (20px - 20px)</span>
              </div>
              <p className="text-gray-600 dark:text-neargray-10 text-xs mt-2 italic ml-4">
                (* Accept only .png, .jpg, .jpeg, .gif, .webp, .svg extensions)
              </p>
            </div>
            {loading ? (
              <div className="col-span-2">
                <Skeleton className="flex h-12" />
              </div>
            ) : (
              <div className="flex flex-col items-start col-span-2">
                <div className="h-[70px] border w-full relative text-nearblue-600 dark:text-neargray-10 px-3 py-2 text-sm bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800">
                  <label className="w-full h-full flex items-center justify-center  hover:cursor-pointer overflow-hidden">
                    <input
                      accept=".png, .jpg, .jpeg, .gif, .webp, .svg"
                      disabled={isSubscriptionCancelled}
                      hidden
                      name="icon"
                      onChange={handleIconChange}
                      required
                      type="file"
                    />
                    {iconPreview?.icon || campaignData?.data?.icon ? (
                      <img
                        alt="Icon"
                        className="border dark:border-black-200"
                        height={40}
                        src={
                          iconPreview?.icon ? iconPreview?.icon : '/dummy.jpg'
                        }
                        width={40}
                      />
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-neargray-10">
                        Select Icon
                      </span>
                    )}
                  </label>
                </div>
                {formik?.touched?.icon && formik?.errors?.icon && (
                  <small className="text-red-500 text-center my-1">
                    {formik?.errors?.icon}
                  </small>
                )}
              </div>
            )}
          </div>
          <div className="ml-[51px] mr-6 py-4 flex flex-row justify-end">
            {campaignData &&
              campaignData?.data?.text &&
              campaignData?.data?.site_name &&
              campaignData?.data?.link_name &&
              campaignData?.data?.icon && (
                <DialogRoot placement={'center'} size="xs">
                  <DialogTrigger asChild>
                    <button
                      className="mx-2 text-sm bg-green-500 dark:bg-green-250 text-[13px] px-10  focus:outline-none text-white text-center font-semibold py-2 rounded  hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500"
                      type="button"
                    >
                      Preview
                    </button>
                  </DialogTrigger>
                  <PreviewAd campaignData={campaignData?.data} />
                </DialogRoot>
              )}

            <button
              className={`text-sm text-[13px] px-10
               focus:outline-none text-white text-center font-semibold py-2 bg-green-500 dark:bg-green-250 rounded ${
                 isSubmitting || isSubscriptionCancelled
                   ? 'cursor-not-allowed opacity-60'
                   : 'hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500'
               } `}
              disabled={isSubmitting || isSubscriptionCancelled}
              onClick={() => formik.handleSubmit()}
              type="button"
            >
              Update
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <StartForm
          campaignData={campaignData}
          campaignId={campaignId}
          campaignMutate={campaignMutate}
          loading={loading}
        />
      </div>
    </>
  );
};
export default TextAdForm;
