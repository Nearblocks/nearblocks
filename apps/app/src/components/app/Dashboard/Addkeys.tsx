import { DialogContent, DialogOverlay } from '@reach/dialog';
import { FormikValues, useFormik } from 'formik';
import get from 'lodash/get';
import React from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import useAuth, { request } from '@/hooks/app/useAuth';
import { catchErrors } from '@/utils/app/libs';

import Close from '../Icons/Close';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Please enter name'),
});

interface Props {
  isOpen: boolean;
  mutate: () => void;
  onToggleAdd: () => void;
  selected: string | undefined;
}

const AddKeys = ({ isOpen, mutate, onToggleAdd, selected }: Props) => {
  const { data: keyData } = useAuth(selected ? `/keys/${selected}` : '');
  const key = get(keyData, 'key') || null;
  const onSubmit = async (values: FormikValues) => {
    try {
      if (selected) {
        values.id = key?.id;
        await request.post(`/keys/${selected}`, values);
        if (!toast.isActive('key-updated')) {
          toast.success('Key Updated', {
            toastId: 'key-updated',
          });
        }
      } else {
        await request.post('/keys', values);
        if (!toast.isActive('key-added')) {
          toast.success('Key Added', {
            toastId: 'key-added',
          });
        }
      }
      onToggleAdd();
      mutate();
      formik.resetForm();
    } catch (error) {
      const message = catchErrors(error);
      if (!toast.isActive('key-added-error')) {
        toast.error(message, {
          toastId: 'key-added-error',
        });
      }
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
    <DialogOverlay
      className="fixed bg-gray-600 dark:text-neargray-10 bg-opacity-20 inset-0 z-30 flex items-center justify-center"
      isOpen={isOpen}
      onDismiss={onToggleAdd}
    >
      <DialogContent
        aria-label="Qr Code"
        className="w-full max-w-lg mx-auto bg-white dark:bg-black-600 shadow-lg rounded-lg overflow-hidden"
      >
        <div className="flex items-center justify-between  px-6 pt-8">
          <h4 className="flex items-center text-sm break-all">
            {selected ? 'Edit API Key' : 'Add API Key'}
          </h4>
          <button
            className="text-gray-500 dark:text-neargray-10 fill-current"
            onClick={onToggleAdd}
          >
            <Close />
          </button>
        </div>
        <div className="px-6 pb-5 pt-2">
          {selected && (
            <div className="py-2">
              <p className="text-sm text-gray-600 dark:text-neargray-10 py-2">
                Key
              </p>
              <input
                autoComplete="off"
                className="w-full border dark:border-black-200 rounded text-xs outline-green-500 py-2 px-2"
                disabled
                name="key"
                value={key?.token}
              />
            </div>
          )}
          <div className="py-2">
            <p className="text-sm text-gray-600 dark:text-neargray-10 py-2">
              App name
            </p>
            <input
              autoComplete="off"
              className="w-full border text-black-300 dark:text-white bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-xs py-2 px-2"
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
              onClick={onToggleAdd}
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
              Add key
            </button>
          </div>
        </div>
      </DialogContent>
    </DialogOverlay>
  );
};

export default AddKeys;
