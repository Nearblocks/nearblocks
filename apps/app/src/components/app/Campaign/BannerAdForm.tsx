/* eslint-disable @next/next/no-img-element */
import { FormikValues, useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { request } from '@/hooks/app/useAuth';
import { bannerCampaignValidation } from '@/utils/app/validationSchema';
import { CampaignProps } from '@/utils/types';

import Avatar from '../Icons/Avatar';
import EmailCircle from '../Icons/EmailCircle';
import LoginCircle from '../Icons/LoginCircle';
import Skeleton from '../skeleton/common/Skeleton';
import StartForm from './StartForm';

type BannerPreview = {
  desktopRight?: string;
  mobile?: string;
};

const BannerAdForm = ({
  campaignData,
  campaignId,
  campaignMutate,
  loading,
  mutate,
}: CampaignProps) => {
  const validationSchema = bannerCampaignValidation(campaignData);
  const [bannerPreview, setBannerPreview] = useState<BannerPreview>({});
  const [banner, setBanner] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscriptionCancelled, setIsSubscriptionCancelled] = useState(false);

  useEffect(() => {
    if (campaignId && campaignData) {
      const mobUrl = campaignData?.data?.mobile_image_url;
      const desktopRightUrl = campaignData?.data?.desktop_image_right_url;

      setBannerPreview({
        desktopRight: desktopRightUrl,
        mobile: mobUrl,
      });

      formik.setFieldValue('desktop_image_right', desktopRightUrl);
      formik.setFieldValue('mobile_image', mobUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, campaignData]);

  useEffect(() => {
    if (campaignData?.data?.subscription?.status === 'canceled') {
      setIsSubscriptionCancelled(true);
    } else {
      setIsSubscriptionCancelled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignData?.data?.subscription?.status]);

  const onSubmit = async (values: FormikValues) => {
    const formData = new FormData();
    formData.append('is_active', '0');
    formData.append('url', values?.url);
    // Only append images if it's a File (indicating it has been changed)
    if (values?.desktop_image_right instanceof File) {
      formData.append('desktop_image_right', values?.desktop_image_right);
    }
    if (values?.mobile_image instanceof File) {
      formData.append('mobile_image', values?.mobile_image);
    }
    setIsSubmitting(true);
    try {
      await request.post(`/campaigns/${campaignId}`, formData);
      if (!toast.isActive('campaign-update')) {
        toast.success('Campaign Information updated', {
          toastId: 'campaign-update',
        });
      }
      setIsSubmitting(false);
      mutate();
      campaignMutate();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        if (!toast.isActive('campaign-update-submit-error')) {
          toast.error(error?.response?.data?.message, {
            toastId: 'campaign-update-submit-error',
          });
        }
      } else {
        if (!toast.isActive('campaign-update')) {
          toast.error('Something went wrong', {
            toastId: 'campaign-update-error',
          });
        }
      }
      setIsSubmitting(false);
    }
  };

  const handleDesktopImageRightChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    formik.setFieldTouched('desktop_image_right', true, false);
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setBanner({ ...banner, desktopRight: e.target.files[0] });
      setBannerPreview({ ...bannerPreview, desktopRight: url });
      formik.setFieldValue('desktop_image_right', e.target.files[0]);
    }
  };

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldTouched('mobile_image', true, false);
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setBanner({ ...banner, mobile: e.target.files[0] });
      setBannerPreview({ ...bannerPreview, mobile: url });
      formik.setFieldValue('mobile_image', e.target.files[0]);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      desktop_image_right: campaignData?.data?.desktop_image_right_url || null,
      mobile_image: campaignData?.data?.mobile_image_url || null,
      url: campaignData?.data?.url || '',
    },
    onSubmit,
    validateOnBlur: true,
    validateOnChange: true,
    validationSchema,
  });

  return (
    <>
      <form>
        <div className="rounded-xl border dark:border-black-200 bg-white dark:bg-black-600 soft-shadow">
          <div className="px-5 py-5 border-b dark:border-black-200">
            <p className="text-base text-black dark:text-neargray-10">
              Campaign Information
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-neargray-10 mt-2 px-6 py-4">
            Edit the below campaign informations
          </p>
          <div>
            <div className="gap-1 items-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4 border-b dark:border-black-200">
                <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center">
                  <Avatar /> <span className="ml-2">Placement</span>
                </p>
                {loading ? (
                  <div className="w-full md:w-1/5">
                    <Skeleton className="flex w-36 h-4" />
                  </div>
                ) : (
                  <p className="text-sm text-black dark:text-neargray-10 font-bold">
                    {campaignData?.data?.title}
                  </p>
                )}
              </div>
            </div>
            {campaignData?.data?.start_date && (
              <div className="gap-1 items-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4 border-b dark:border-black-200">
                  <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center">
                    <LoginCircle /> <span className="ml-2">Start Date</span>
                  </p>
                  {loading ? (
                    <div className="w-full md:w-1/5">
                      <Skeleton className="flex w-36 h-4" />
                    </div>
                  ) : (
                    <p className="text-sm text-black dark:text-neargray-10 font-bold">
                      {`${campaignData?.data?.start_date.slice(0, 19)} (UTC)`}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4 border-b dark:border-black-200">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4 border-b dark:border-black-200">
              <div className="text-gray-600 dark:text-neargray-10 text-sm flex flex-col items-start">
                <div className="flex items-center">
                  <Avatar />{' '}
                  <span className="ml-2">
                    Desktop version - Right (321px - 101px)
                  </span>
                </div>
                <p className="text-gray-600 dark:text-neargray-10 text-xs mt-2 italic ml-4">
                  (* Accept only .png, .jpg, .jpeg, .gif, .webp, .svg
                  extensions)
                </p>
              </div>
              {loading ? (
                <div className="col-span-2">
                  <Skeleton className="flex h-12" />
                </div>
              ) : (
                <div className="flex flex-col items-start col-span-2">
                  <div className="h-[70px] border w-full relative text-black dark:text-neargray-10 px-3 py-2 text-sm bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800">
                    <label className="w-full h-full flex items-center justify-center hover:cursor-pointer overflow-hidden">
                      <input
                        accept=".png, .jpg, .jpeg, .gif, .webp, .svg"
                        disabled={isSubscriptionCancelled}
                        hidden
                        name="desktop_image_right"
                        onBlur={formik.handleBlur}
                        onChange={handleDesktopImageRightChange}
                        type="file"
                      />
                      {bannerPreview?.desktopRight ||
                      campaignData?.data?.desktop_image_right_url ? (
                        <img
                          alt="Desktop ad banner"
                          height={101}
                          src={
                            bannerPreview?.desktopRight
                              ? bannerPreview?.desktopRight
                              : '/dummy.jpg'
                          }
                          style={{ height: 'inherit' }}
                          width={321}
                        />
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-neargray-10">
                          Select Banner Image
                        </span>
                      )}
                    </label>
                  </div>
                  {formik?.touched?.desktop_image_right &&
                    formik?.errors?.desktop_image_right && (
                      <small className="text-red-500 text-center my-1">
                        {formik?.errors?.desktop_image_right}
                      </small>
                    )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4 border-b dark:border-black-200">
              <div className="text-gray-600 dark:text-neargray-10 text-sm flex flex-col items-start">
                <div className="flex items-center">
                  <Avatar />{' '}
                  <span className="ml-2">Mobile version (730px - 90px)</span>
                </div>
                <p className="text-gray-600 dark:text-neargray-10 text-xs mt-2 italic ml-4">
                  (* Accept only .png, .jpg, .jpeg, .gif, .webp, .svg
                  extensions)
                </p>
              </div>
              {loading ? (
                <div className="col-span-2">
                  <Skeleton className="flex h-12" />
                </div>
              ) : (
                <div className="flex flex-col items-start col-span-2">
                  <div className="h-[70px] border w-full relative text-black dark:text-neargray-10 px-3 py-2 text-sm bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800">
                    <label className="w-full h-full flex items-center justify-center hover:cursor-pointer overflow-hidden">
                      <input
                        accept=".png, .jpg, .jpeg, .gif, .webp, .svg"
                        disabled={isSubscriptionCancelled}
                        hidden
                        name="mobile_image"
                        onBlur={formik.handleBlur}
                        onChange={handleMobileImageChange}
                        type="file"
                      />
                      {bannerPreview?.mobile ||
                      campaignData?.data?.mobile_image_url ? (
                        <img
                          alt="Mobile ad banner"
                          height={90}
                          src={
                            bannerPreview?.mobile
                              ? bannerPreview?.mobile
                              : '/dummy.jpg'
                          }
                          style={{ height: 'inherit' }}
                          width={730}
                        />
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-neargray-10">
                          Select Banner Image
                        </span>
                      )}
                    </label>
                  </div>
                  {formik?.touched?.mobile_image &&
                    formik?.errors?.mobile_image && (
                      <small className="text-red-500 text-center my-1">
                        {formik?.errors?.mobile_image}
                      </small>
                    )}
                </div>
              )}
            </div>
            <div className="ml-[51px] py-4 mr-6 flex flex-col items-end">
              <button
                className={`text-sm text-[13px] px-10 focus:outline-none text-white text-center font-semibold py-2 bg-green-500 dark:bg-green-250 rounded ${
                  isSubmitting || isSubscriptionCancelled
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500'
                }`}
                disabled={isSubmitting || isSubscriptionCancelled}
                onClick={() => formik.handleSubmit()}
                type="button"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-6">
        <StartForm
          campaignData={campaignData}
          campaignId={campaignId}
          campaignMutate={campaignMutate}
          loading={loading}
          mutate={mutate}
        />
      </div>
    </>
  );
};
export default BannerAdForm;
