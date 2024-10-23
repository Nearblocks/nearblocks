import React, { useState } from 'react';
import * as Yup from 'yup';
import { FormikValues, useFormik } from 'formik';
import { toast } from 'react-toastify';
import { request } from '@/hooks/useAuth';
import { catchErrors } from '@/utils/libs';
import LockCircle from '../Icons/LockCircle';
import Visibility from '../Icons/Visibility';
import VisibilityOff from '../Icons/VisibilityOff';

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
  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({
    password1: false,
    password2: false,
  });

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

  const togglePasswordVisibility = (
    e: React.MouseEvent<HTMLButtonElement>,
    input: string,
  ) => {
    e.preventDefault();
    setShowPasswords((prevState) => ({
      ...prevState,
      [input]: !prevState[input],
    }));
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
    <form className="w-full bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit my-4">
      <div className="border-b px-5 py-5 dark:border-black-200">
        <p className="text-black dark:text-neargray-10">Password</p>
        <p className="text-sm text-gray-600 dark:text-neargray-10 mt-2">
          Set your account password here
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1  px-6 py-4  border-b dark:border-black-200">
        <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center">
          <LockCircle /> <span className="ml-2">Enter password</span>
        </p>
        <div className="flex flex-col items-start col-span-2">
          <div className="relative w-full">
            <input
              type={showPasswords.password1 ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              className="w-full border px-3 py-2 bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-sm"
            />
            <button
              className="absolute top-0 right-0 h-full px-3"
              onClick={(e) => togglePasswordVisibility(e, 'password1')}
            >
              {showPasswords.password1 ? (
                <Visibility className="w-4 h-4" />
              ) : (
                <VisibilityOff className="w-4 h-4" />
              )}
            </button>
          </div>
          {formik.touched.old_password && formik.errors.password && (
            <small className="text-red-500 text-center my-1">
              {formik.errors.password}
            </small>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1  px-6 py-4  border-b dark:border-black-200">
        <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center">
          <LockCircle /> <span className="ml-2">Confirm password</span>
        </p>
        <div className="flex flex-col items-start col-span-2">
          <div className="relative w-full">
            <input
              type={showPasswords.password2 ? 'text' : 'password'}
              name="password_confirmation"
              autoComplete="current-password"
              value={formik.values.password_confirmation}
              onChange={formik.handleChange}
              className="w-full border px-3 py-2 bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 text-sm"
            />
            <button
              className="absolute top-0 right-0 h-full px-3"
              onClick={(e) => togglePasswordVisibility(e, 'password2')}
            >
              {showPasswords.password2 ? (
                <Visibility className="w-4 h-4" />
              ) : (
                <VisibilityOff className="w-4 h-4" />
              )}
            </button>
          </div>
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
          className="text-[13px] hover:delay-300 hover:duration-300 mx-1 hover:bg-gray-200 dark:hover:bg-black-200 px-7 py-3 rounded"
          onClick={onCancelClick}
        >
          Cancel
        </button>
        <button
          disabled={formik.isSubmitting}
          type="button"
          onClick={() => formik.handleSubmit()}
          className={`text-sm text-[13px] px-7 focus:outline-none text-center font-semibold text-white py-3 bg-green-500 dark:bg-green-250 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500 rounded ${
            formik.isSubmitting && 'cursor-not-allowed opacity-60'
          } `}
        >
          Set Password
        </button>
      </div>
    </form>
  );
};

export default SetPassword;
