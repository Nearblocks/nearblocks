import { FormikValues, useFormik } from 'formik';
import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import {
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from '@/components/ui/dialog';
import { request } from '@/hooks/app/useAuth';
import { catchErrors } from '@/utils/app/libs';

import Visibility from '@/components/app/Icons/Visibility';
import VisibilityOff from '@/components/app/Icons/VisibilityOff';
import { useConfig } from '@/hooks/app/useConfig';
import { signOut } from '@/utils/app/actions';

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be an 8 character')
    .required('Please enter  password'),
});

const Delete = () => {
  const [confirm, setConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const { userAuthURL: baseURL } = useConfig();

  const onDelete = () => {
    formik.resetForm();
  };

  const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const onSubmit = async (values: FormikValues) => {
    try {
      await request(baseURL).delete(`users/me`, {
        data: { password: values.password },
      });
      signOut();
    } catch (error) {
      const message = catchErrors(error);
      if (!toast.isActive('delete-user-error')) {
        toast.error(message, {
          toastId: 'delete-user-error',
        });
      }
    } finally {
      closeButton.current?.click();
    }
  };

  const formik = useFormik({
    initialValues: {
      password: '',
    },
    onSubmit,
    validationSchema,
  });
  return (
    <>
      <div className="w-full bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit my-4">
        <div className="border-b px-5 py-5 dark:border-black-200">
          <p className="text-nearblue-600 dark:text-neargray-10 ">
            Delete Account
          </p>
        </div>
        <div className="border-b items-center justify-between dark:border-black-200">
          <p className="text-sm text-nearblue-600 dark:text-neargray-10  mt-2 px-6 pt-4 font-semibold">
            Are you sure you want to permanently delete your user account?
            Recovery is not possible upon delete confirmation
          </p>
          <div className="sm:flex block px-6 py-4  border-b dark:border-black-200 items-center justify-between">
            <div className="flex items-center m-2">
              <input onChange={() => setConfirm((o) => !o)} type="checkbox" />
              <span className="text-sm text-gray-600 dark:text-neargray-10 ml-2">
                Confirm that I want to delete my account.
              </span>
            </div>
            <DialogRoot placement={'center'} size="xs">
              <DialogTrigger asChild>
                <button
                  className={`text-[13px] text-white font-semibold px-6 py-2 ml-2 ${
                    confirm
                      ? '!bg-red-700 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-red-800/40'
                      : '!bg-red-800/40 cursor-not-allowed opacity-60'
                  } rounded`}
                  onClick={onDelete}
                >
                  Delete Account
                </button>
              </DialogTrigger>

              <DialogContent
                aria-label="Delete Confirmation"
                className="w-full max-w-lg mx-auto bg-white dark:bg-black-600 shadow-lg rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between text-gray-600 dark:text-neargray-10  px-6 pt-8">
                  <h4 className="flex items-center text-sm break-all">
                    Confirmation required
                  </h4>
                </div>
                <div className="px-6 pb-2 pt-2">
                  <div className="py-2 pb-10">
                    <div className="grid grid-cols-2 gap-1  px-6 py-4  border-b dark:border-black-200">
                      <p className="text-gray-600 dark:text-neargray-10 text-sm flex mt-2">
                        Password
                      </p>
                      <div className="flex flex-col items-start">
                        <div className="relative w-full">
                          <input
                            className="border w-full text-nearblue-600 dark:text-neargray-10 px-3 py-2 text-sm bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800"
                            name="password"
                            onChange={formik.handleChange}
                            placeholder="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={formik.values.password}
                          />
                          <button
                            className="absolute top-0 right-0 h-full px-3"
                            onClick={(e) => togglePasswordVisibility(e)}
                          >
                            {showPassword ? (
                              <Visibility className="w-4 h-4" />
                            ) : (
                              <VisibilityOff className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {formik.touched.password && formik.errors.password && (
                          <small className="text-red-500 text-center  my-1">
                            {formik.errors.password}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end  py-4">
                    <button
                      className="text-[13px] delay-300 duration-300 mx-1 hover:bg-gray-200 dark:hover:bg-black-200 px-3 py-3 rounded"
                      onClick={() => closeButton.current?.click()}
                    >
                      Cancel
                    </button>
                    <button
                      className={`text-sm text-[13px] px-3 focus:outline-none text-center text-white font-semibold  py-3 !bg-red-700 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-red-800/40 rounded ${
                        formik.isSubmitting && 'cursor-not-allowed opacity-60'
                      } `}
                      disabled={formik.isSubmitting}
                      onClick={() => formik.handleSubmit()}
                      type="button"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
                <DialogCloseTrigger
                  className="text-gray-500 fill-current"
                  ref={closeButton}
                />
              </DialogContent>
            </DialogRoot>
          </div>
        </div>
      </div>
    </>
  );
};

export default Delete;
