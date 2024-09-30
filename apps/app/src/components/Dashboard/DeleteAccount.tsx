import * as Yup from 'yup';
import { FormikValues, useFormik } from 'formik';
import { toast } from 'react-toastify';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import Cookies from 'js-cookie';
/* import { useDisconnect } from "wagmi"; */
import { request } from '@/hooks/useAuth';
import { catchErrors } from '@/utils/libs';
import useStorage from '@/hooks/useStorage';
import Close from '../Icons/Close';

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be an 8 character')
    .required('Please enter  password'),
});

const Delete = () => {
  const router = useRouter();
  /*   const { disconnect } = useDisconnect(); */
  const [confirm, setConfirm] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [, setToken] = useStorage('token');
  const [, setRole] = useStorage('role');
  const [, setUser] = useStorage('user');

  const onDelete = () => {
    setIsDeleteOpen((open) => !open);
    formik.resetForm();
  };

  const onSubmit = async (values: FormikValues) => {
    try {
      await request.post(`/profile/delete`, values);
      setToken('');
      setRole('');
      setUser('');
      /*  disconnect(); */
      Cookies.set('token', '');
      router.push('/login');
    } catch (error) {
      const message = catchErrors(error);
      if (!toast.isActive('delete-user-error')) {
        toast.error(message, {
          toastId: 'delete-user-error',
        });
      }
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
          <p className="text-black dark:text-neargray-10 ">Delete Account</p>
        </div>
        <div className="border-b items-center justify-between dark:border-black-200">
          <p className="text-sm text-black dark:text-neargray-10  mt-2 px-6 pt-4 font-semibold">
            Are you sure you want to permanently delete your user account?
            Recovery is not possible upon delete confirmation
          </p>
          <div className="sm:flex block px-6 py-4  border-b dark:border-black-200 items-center justify-between">
            <div className="flex items-center m-2">
              <input type="checkbox" onChange={() => setConfirm((o) => !o)} />
              <span className="text-sm text-gray-400 dark:text-neargray-10  ml-2">
                Confirm that I want to delete my account.
              </span>
            </div>
            <button
              onClick={onDelete}
              className={`text-[13px] text-white font-semibold px-6 py-2 ml-2 ${
                confirm
                  ? 'bg-red-700 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-red-800/40'
                  : 'bg-red-800/40'
              } rounded`}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <DialogOverlay
        isOpen={isDeleteOpen}
        onDismiss={onDelete}
        className="fixed bg-gray-600 dark:text-neargray-10  bg-opacity-20 inset-0  pt-10 z-30 flex items-start justify-center"
      >
        <DialogContent
          aria-label="Delete Confirmation"
          className="w-full max-w-lg mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
        >
          <div className="flex items-center justify-between  px-6 pt-8">
            <h4 className="flex items-center text-sm break-all">
              Confirmation required
            </h4>
            <button
              className="text-gray-500 dark:text-neargray-10  fill-current"
              onClick={onDelete}
            >
              <Close />
            </button>
          </div>
          <div className="px-6 pb-5 pt-2">
            <div className="py-2 pb-10">
              <div className="grid grid-cols-3 gap-1  px-6 py-4  border-b dark:border-black-200">
                <p className="text-gray-500 dark:text-neargray-10 text-sm flex mt-2">
                  Password
                </p>
                <div className="flex flex-col items-start">
                  <input
                    type="password"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    className="border dark:border-black-200 outline-primary px-3 py-2 rounded text-sm dark:bg-black-300"
                  />
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
                onClick={onDelete}
                className="text-[13px] delay-300 duration-300 mx-1 hover:bg-gray-200 dark:hover:bg-black-200 px-3 py-3 rounded"
              >
                Cancel
              </button>
              <button
                disabled={formik.isSubmitting}
                type="button"
                onClick={() => formik.handleSubmit()}
                className={`text-sm text-[13px] px-3 focus:outline-none  text-white  text-center font-semibold  py-3 bg-red-700 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-red-800/40 rounded ${
                  formik.isSubmitting && 'cursor-not-allowed bg-primary-100'
                } `}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogOverlay>
    </>
  );
};

export default Delete;
