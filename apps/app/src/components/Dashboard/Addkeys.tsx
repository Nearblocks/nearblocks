import React from 'react';
import * as Yup from 'yup';
import get from 'lodash/get';
import { FormikValues, useFormik } from 'formik';
import { toast } from 'react-toastify';
import { DialogOverlay, DialogContent } from '@reach/dialog';

import Close from '../Icons/Close';
import useAuth, { request } from '@/hooks/useAuth';
import { catchErrors } from '@/utils/libs';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Please enter name'),
});

interface Props {
  onToggleAdd: () => void;
  isOpen: boolean;
  selected: string | undefined;
  mutate: () => void;
}

const AddKeys = ({ onToggleAdd, isOpen, selected, mutate }: Props) => {
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
    initialValues: initialValues,
    onSubmit,
    validationSchema,
    enableReinitialize: true,
  });

  return (
    <DialogOverlay
      isOpen={isOpen}
      onDismiss={onToggleAdd}
      className="fixed bg-gray-600 dark:text-neargray-10 bg-opacity-20 inset-0 z-30 flex items-center justify-center"
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
                name="key"
                autoComplete="off"
                value={key?.token}
                disabled
                className="w-full border dark:border-black-200 rounded text-xs outline-green-500 py-2 px-2"
              />
            </div>
          )}
          <div className="py-2">
            <p className="text-sm text-gray-600 dark:text-neargray-10 py-2">
              App name
            </p>
            <input
              name="name"
              autoComplete="off"
              value={formik.values.name}
              onChange={formik.handleChange}
              className="w-full border text-black-300 dark:text-white bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-xs py-2 px-2"
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
              disabled={formik.isSubmitting}
              type="button"
              onClick={() => formik.handleSubmit()}
              className={`text-sm text-[13px] px-3 focus:outline-none  text-white text-center font-semibold py-3 bg-green-500 dark:bg-green-250 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500 rounded ${
                formik.isSubmitting && 'cursor-not-allowed opacity-60'
              } `}
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
