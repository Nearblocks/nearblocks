import * as Yup from 'yup';

import { CampaignData } from '../types';

type ImageDimensions = {
  height: number;
  width: number;
};

export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    // Check if the file is an image
    if (
      ![
        'image/gif',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/svg+xml',
        'image/webp',
      ].includes(file.type)
    ) {
      reject(new Error('File is not an image'));
      return;
    }
    const img = new Image();
    img.onload = () => {
      resolve({ height: img.height, width: img.width });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const typeValidation = Yup.object().shape({
  height: Yup.number()
    .typeError('Height must be a number')
    .required('Height is required'),
  name: Yup.string()
    .matches(/^[a-zA-Z\s]*$/, 'Name should only contain letters and spaces')
    .required('Name is required'),
  width: Yup.number()
    .typeError('Width must be a number')
    .required('width is required'),
});

export const textCampaignValidation = (campaignData: CampaignData) => {
  return Yup.object().shape({
    icon: Yup.mixed()
      .required('Icon image is required')
      .test(
        'fileType',
        'Unsupported file format. Only .png, .jpg, .jpeg, .gif, .webp, .svg are allowed.',
        (value) => {
          if (!value || value === campaignData?.data?.icon) return true; // Skip validation if no file is selected
          if (value instanceof File) {
            return [
              'image/gif',
              'image/jpeg',
              'image/jpg',
              'image/png',
              'image/svg+xml',
              'image/webp',
            ].includes(value.type);
          }
          return false;
        },
      )
      .test(
        'imageDimensions',
        'Icon image dimensions should be 20px*20px',
        async function (value) {
          if (!value || value === campaignData?.data?.icon) {
            return true; // Skip validation if the value hasn't changed
          }
          if (value instanceof File) {
            try {
              const { height, width } = await getImageDimensions(value);
              return width === 20 && height === 20;
            } catch (error) {}
          }
          return false; // Return false if the value is not a File
        },
      ),
    link_name: Yup.string().required('Link text is required'),
    site_name: Yup.string().required('Site name is required'),
    text: Yup.string().required('Display text is required'),
    url: Yup.string()
      .matches(
        /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|localhost)(:\d+)?(\/[-a-zA-Z0-9%_.~+&:]*)*(\?[;&a-zA-Z0-9%_.~+=-]*)?(#[a-zA-Z0-9_-]*)?$/,
        'Enter a valid URL',
      )
      .required('URL is required'),
  });
};

export const textAdCampaignValidation = () => {
  return Yup.object().shape({
    icon: Yup.mixed()
      .required('Icon image is required')
      .test(
        'fileType',
        'Unsupported file format. Only .png, .jpg, .jpeg, .gif, .webp, .svg are allowed.',
        (value) => {
          if (!value) return true; // Skip validation if no file is selected
          if (value instanceof File) {
            return [
              'image/gif',
              'image/jpeg',
              'image/jpg',
              'image/png',
              'image/svg+xml',
              'image/webp',
            ].includes(value.type);
          }
          return false;
        },
      )
      .test(
        'imageDimensions',
        'Icon image dimensions should be 20px*20px',
        async function (value) {
          if (!value) {
            return true; // Skip validation if the value hasn't changed
          }
          if (value instanceof File) {
            try {
              const { height, width } = await getImageDimensions(value);
              return width === 20 && height === 20;
            } catch (error) {}
          }
          return false; // Return false if the value is not a File
        },
      ),
    link_name: Yup.string().required('Link text is required'),
    site_name: Yup.string().required('Site name is required'),
    text: Yup.string().required('Display text is required'),
    url: Yup.string()
      .matches(
        /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|localhost)(:\d+)?(\/[-a-zA-Z0-9%_.~+&:]*)*(\?[;&a-zA-Z0-9%_.~+=-]*)?(#[a-zA-Z0-9_-]*)?$/,
        'Enter a valid URL',
      )
      .required('URL is required'),
  });
};

export const bannerCampaignValidation = (campaignData: CampaignData) => {
  return Yup.object().shape({
    desktop_image_right: Yup.mixed()
      .required('Desktop image is required')
      .test(
        'fileType',
        'Unsupported file format. Only .png, .jpg, .jpeg, .gif, .webp, .svg are allowed.',
        (value) => {
          if (!value || value === campaignData?.data?.desktop_image_right_url)
            return true; // Skip validation if no file is selected
          if (value instanceof File) {
            return [
              'image/gif',
              'image/jpeg',
              'image/jpg',
              'image/png',
              'image/svg+xml',
              'image/webp',
            ].includes(value.type);
          }
          return false;
        },
      )
      .test(
        'imageDimensions',
        'Desktop image dimensions should be 321px*101px',
        async function (value) {
          if (!value || value === campaignData?.data?.desktop_image_right_url) {
            return true; // Skip validation if the value hasn't changed
          }
          if (value instanceof File) {
            try {
              const { height, width } = await getImageDimensions(value);
              return width === 321 && height === 101;
            } catch (error) {}
          }
          return false; // Return false if the value is not a File
        },
      ),
    mobile_image: Yup.mixed()
      .required('Mobile image is required')
      .test(
        'fileType',
        'Unsupported file format. Only .png, .jpg, .jpeg, .gif, .webp, .svg are allowed.',
        (value) => {
          if (!value || value === campaignData?.data?.mobile_image_url) {
            return true; // Skip validation if no file is selected
          }
          if (value instanceof File) {
            return [
              'image/gif',
              'image/jpeg',
              'image/jpg',
              'image/png',
              'image/svg+xml',
              'image/webp',
            ].includes(value.type);
          }
          return false;
        },
      )
      .test(
        'imageDimensions',
        'Mobile image dimensions should be 730px*90px',
        async function (value) {
          if (!value || value === campaignData?.data?.mobile_image_url) {
            return true; // Skip validation if the value hasn't changed
          }
          if (value instanceof File) {
            try {
              const { height, width } = await getImageDimensions(value);
              return width === 730 && height === 90;
            } catch (error) {}
          }
          return false; // Return false if the value is not a File
        },
      ),
    url: Yup.string()
      .matches(
        /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|localhost)(:\d+)?(\/[-a-zA-Z0-9%_.~+&:]*)*(\?[;&a-zA-Z0-9%_.~+=-]*)?(#[a-zA-Z0-9_-]*)?$/,
        'Enter a valid URL',
      )
      .required('URL is required'),
  });
};
