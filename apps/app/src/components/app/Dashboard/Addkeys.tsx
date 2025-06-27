import { FormikValues, useFormik } from 'formik';
import get from 'lodash/get';
import React, { useRef } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import { DialogCloseTrigger, DialogContent } from '@/components/ui/dialog';
import useAuth, { request } from '@/hooks/app/useAuth';
import { catchErrors } from '@/utils/app/libs';
import { useConfig } from '@/hooks/app/useConfig';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Please enter name'),
});

interface Props {
  mutate: () => void;
  selected: string | undefined;
}

const AddKeys = ({ mutate, selected }: Props) => {
  const { data: keyData, mutate: keyMutate } = useAuth(
    selected ? `/keys/${selected}` : '',
  );
  const closeButton = useRef<HTMLButtonElement>(null);
  const { userApiURL: baseURL } = useConfig();
  const key = get(keyData, 'key') || null;
  const onSubmit = async (values: FormikValues) => {
    try {
      if (selected) {
        values.id = key?.id;
        await request(baseURL).put(`/keys/${selected}`, values);
        if (!toast.isActive('key-updated')) {
          toast.success('Key Updated', {
            toastId: 'key-updated',
          });
        }
      } else {
        await request(baseURL).post('/keys', values);
        if (!toast.isActive('key-added')) {
          toast.success('Key Added', {
            toastId: 'key-added',
          });
        }
      }
      mutate();
      keyMutate();
      formik.resetForm();
    } catch (error) {
      const message = catchErrors(error);
      if (!toast.isActive('key-added-error')) {
        toast.error(message, {
          toastId: 'key-added-error',
        });
      }
    } finally {
      closeButton.current?.click();
    }
  };

  const initialValues = selected
    ? { name: key?.name ? String(key.name) : '' }
    : { name: '' };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    onSubmit,
    validationSchema,
  });

  return (
    <DialogContent
      aria-label="Qr Code"
      className="w-full max-w-lg mx-auto bg-white dark:bg-black-600 shadow-lg rounded-lg overflow-hidden"
    >
      <div className="flex items-center justify-between text-gray-600 dark:text-neargray-10  px-6 pt-8">
        <h4 className="flex items-center text-sm break-all">
          {selected ? 'Edit API Key' : 'Add API Key'}
        </h4>
      </div>
      <div className="px-6 pb-5 pt-2">
        {selected && (
          <div className="py-2">
            <p className="text-sm text-gray-600 dark:text-neargray-10 py-2">
              Key
            </p>
            {key?.token && (
              <input
                autoComplete="off"
                className="w-full border dark:border-black-200 text-gray-600 dark:text-neargray-10 rounded text-xs outline-green-500 py-2 px-2"
                disabled
                name="key"
                value={key?.token}
              />
            )}
          </div>
        )}
        <div className="py-2">
          <p className="text-sm text-gray-600 dark:text-neargray-10 py-2">
            App name
          </p>
          <input
            autoComplete="off"
            className="w-full border text-nearblue-600 dark:text-neargray-10 bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-xs py-2 px-2"
            name="name"
            onChange={formik.handleChange}
            value={formik.values.name}
          />
          {formik.touched.name && formik.errors.name ? (
            <div className="text-red-500 text-xs mt-1">
              {formik.errors.name}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-end  py-4">
          <button
            className="text-[13px] delay-300 duration-300 mx-1 hover:bg-gray-200 dark:hover:bg-black-200 px-3 py-3 rounded"
            onClick={() => closeButton.current?.click()}
          >
            Cancel
          </button>
          <button
            className={`text-sm text-[13px] px-3 focus:outline-none  text-white text-center font-semibold py-3 bg-green-500 dark:bg-green-250 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500 rounded ${
              formik.isSubmitting && 'cursor-not-allowed opacity-60'
            } `}
            disabled={formik.isSubmitting}
            onClick={() => formik.handleSubmit()}
            type="button"
          >
            {selected ? 'Edit Key' : 'Add Key'}
          </button>
        </div>
      </div>
      <DialogCloseTrigger
        className="text-gray-500 fill-current"
        ref={closeButton}
      />
    </DialogContent>
  );
};

export default AddKeys;
