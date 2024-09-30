import React from 'react';
import * as Yup from 'yup';
import { FormikValues, useFormik } from 'formik';
import { toast } from 'react-toastify';
import { request } from '@/hooks/useAuth';
import { catchErrors } from '@/utils/libs';
import LockCircle from '../Icons/LockCircle';

interface Props {
  mutate: () => void;
}

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be an 8 character')
    .required('Please enter  password'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Your passwords do not match')
    .required('Please enter password confirmation'),
});

const SetPassword = ({ mutate }: Props) => {
  const onSubmit = async (values: FormikValues) => {
    try {
      await request.post(`/profile/set-password`, values);
      if (!toast.isActive('password-set')) {
        toast.success('Password set successfully', {
          toastId: 'password-set',
        });
      }
      formik.resetForm();
      mutate();
    } catch (error) {
      const message = catchErrors(error);
      if (!toast.isActive('password-set-error')) {
        toast.error(message, {
          toastId: 'password-set-error',
        });
      }
    }
  };

  const onCancelClick = () => {
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      old_password: '',
      password: '',
      password_confirmation: '',
    },
    onSubmit,
    validationSchema,
  });

  return (
    <div className="w-full bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit my-4">
      <div className="border-b px-5 py-5 dark:border-black-200">
        <p className="text-black dark:text-neargray-10">Password</p>
        <p className="text-sm text-gray-400 dark:text-neargray-50 mt-2">
          Set your account password here
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1  px-6 py-4  border-b dark:border-black-200">
        <p className="text-gray-500 dark:text-neargray-10 text-sm flex items-center">
          <LockCircle /> <span className="ml-2">Enter password</span>
        </p>
        <div className="flex flex-col items-start">
          <input
            type="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            className="border dark:border-black-200 dark:bg-black-300 outline-primary px-3 py-2 rounded text-sm"
          />
          {formik.touched.old_password && formik.errors.password && (
            <small className="text-red-500 text-center my-1">
              {formik.errors.password}
            </small>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1  px-6 py-4  border-b dark:border-black-200">
        <p className="text-gray-500 dark:text-neargray-10 text-sm flex items-center">
          <LockCircle /> <span className="ml-2">Confirm password</span>
        </p>
        <div className="flex flex-col items-start">
          <input
            type="password"
            name="password_confirmation"
            value={formik.values.password_confirmation}
            onChange={formik.handleChange}
            className="border dark:border-black-200 dark:bg-black-300 outline-primary px-3 py-2 rounded text-sm"
          />
          {formik.touched.password_confirmation &&
            formik.errors.password_confirmation && (
              <small className="text-red-500 text-center  my-1">
                {formik.errors.password_confirmation}
              </small>
            )}
        </div>
      </div>
      <div className="flex items-center justify-end px-6 py-4">
        <button
          className="text-[13px] delay-300 duration-300 mx-1 hover:bg-gray-200 dark:hover:bg-black-200 px-7 py-3 rounded"
          onClick={onCancelClick}
        >
          Cancel
        </button>
        <button
          disabled={formik.isSubmitting}
          type="button"
          onClick={() => formik.handleSubmit()}
          className={`text-sm text-[13px] px-7 focus:outline-none text-center font-semibold text-white py-3 bg-green-500 dark:bg-green-250 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-primary rounded ${
            formik.isSubmitting &&
            'cursor-not-allowed bg-green-500 dark:bg-green-250'
          } `}
        >
          Set Password
        </button>
      </div>
    </div>
  );
};

export default SetPassword;
