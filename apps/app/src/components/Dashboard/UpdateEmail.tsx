import React from 'react';
import * as Yup from 'yup';
import dayjs from '../../utils/dayjs';
import { FormikHelpers, FormikValues, useFormik } from 'formik';
import { toast } from 'react-toastify';
/* import { useAccount, useDisconnect } from "wagmi"; */
/* import Cookies from "js-cookie"; */
/* import useStorage from "@/hooks/useStorage"; */
import { catchErrors } from '@/utils/libs';
import Avatar from '../Icons/Avatar';
import { request } from '@/hooks/useAuth';
import EmailCircle from '../Icons/EmailCircle';
import LoginCircle from '../Icons/LoginCircle';
import Clock from '../Icons/Clock';
import Skeleton from '../skeleton/common/Skeleton';

interface User {
  username?: string;
  email?: string;
  last_login_at?: string;
}

interface UpdateEmailProps {
  user: User | null;
  loading: boolean;
  mutate: () => void;
}

const UpdateEmail = ({ user, loading, mutate }: UpdateEmailProps) => {
  /*  const { disconnect } = useDisconnect();
  const [, setToken] = useStorage("token");
  const [, setRole] = useStorage("role");
  const [, setUser] = useStorage("user");
  const { isConnected } = useAccount(); */

  const validationSchema = user?.username
    ? Yup.object().shape({
        email: Yup.string()
          .email('Please enter a valid email')
          .required('Please enter email'),
      })
    : Yup.object().shape({
        email: Yup.string()
          .email('Please enter a valid email')
          .required('Please enter email'),
        username: Yup.string().required('Please enter username'),
      });

  const onSubmit = async (
    values: FormikValues,
    { setSubmitting, resetForm }: FormikHelpers<any>,
  ): Promise<void> => {
    try {
      const resp = await request.post(`/profile/email`, values);
      if (resp?.status === 200) {
        mutate();
        if (!toast.isActive('update-email')) {
          toast.success(
            'Email confirmation Link has been sent to email. Please verify and re-login',
            {
              toastId: 'update-email',
            },
          );
        }
        /* if (!isConnected) {
          setToken("");
          setRole("");
          setUser("");
          disconnect();
          Cookies.remove("token");
          setTimeout(() => {
            router?.push("/login");
          }, "2000");
        } */
      }
    } catch (error: any) {
      const errors = error?.response?.data?.error;
      if (errors) {
        if (!toast.isActive('update-email-error')) {
          toast.error(errors, {
            toastId: 'update-email-error',
          });
        }
      } else {
        const message = catchErrors(error);
        if (!toast.isActive('update-email-error')) {
          toast.error(message, {
            toastId: 'update-email-error',
          });
        }
      }
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const onCancelClick = () => {
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      email: user?.email ? user?.email : '',
      username: '',
    },
    onSubmit,
    validationSchema,
    enableReinitialize: true,
  });

  return (
    <div className="w-full bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl  soft-shadow h-fit mb-4">
      <div className="border-b px-5 py-5 dark:border-black-200">
        <p className="text-black dark:text-neargray-10">User Settings</p>
      </div>
      <div className="gap-1 items-center">
        <p className="text-sm text-gray-600 dark:text-neargray-10 mt-2 px-6 py-4">
          Edit your account settings here
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
          <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center mb-2">
            <Avatar /> <span className="ml-2">Username</span>
          </p>
          {loading ? (
            <div className="w-full md:w-1/5">
              <Skeleton className="flex w-20 h-4" />
            </div>
          ) : user?.username ? (
            <p className="text-sm text-black dark:text-neargray-10 font-bold">
              {user?.username}
            </p>
          ) : (
            <div className="flex flex-col items-start">
              <input
                name="username"
                autoComplete="off"
                value={formik.values.username}
                onChange={formik.handleChange}
                className="border px-3 py-2 text-sm bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800"
              />
              {formik.touched.username && formik.errors.username && (
                <small className="text-red-500 text-center my-1">
                  {formik.errors.username}
                </small>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
        <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center mb-2">
          <EmailCircle /> <span className="ml-2">Email Address</span>
        </p>
        <div className="flex flex-col items-start col-span-2">
          <input
            name="email"
            autoComplete="off"
            value={formik.values.email}
            onChange={formik.handleChange}
            // className="border px-3 py-2 text-sm outline-green-500 rounded-md "\
            className="w-full border px-3 py-2 text-sm bg-white dark:bg-black-600 dark:border-black-200 border-{#E5E7EB} rounded-md focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800"
          />
          {formik.touched.email && formik.errors.email && (
            <small className="text-red-500 text-center my-1">
              {formik.errors.email}
            </small>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
        <p className="text-gray-600 dark:text-neargray-10 text-sm flex items-center mb-2">
          <LoginCircle /> <span className="ml-2">Last Login</span>
        </p>
        {loading ? (
          <div className="w-full md:w-1/5">
            <Skeleton className="flex w-20 h-4" />
          </div>
        ) : (
          <p className="text-sm text-black dark:text-neargray-10 flex col-span-2">
            <Clock className="my-auto mr-1" />
            {dayjs(user?.last_login_at).format('YYYY-MM-DD  HH:mm:ss')}
          </p>
        )}
      </div>
      <div className="flex items-center justify-end px-6 py-4">
        <button
          className="text-[13px] hover:delay-300 hover:duration-300 mx-1 hover:bg-gray-200 dark:hover:bg-black-200 px-6 py-2 rounded"
          onClick={onCancelClick}
        >
          Cancel
        </button>
        <button
          disabled={formik.isSubmitting}
          type="button"
          onClick={() => formik.handleSubmit()}
          className={`text-sm text-[13px] px-6 focus:outline-none text-white dark:text-neargray-10  text-center font-semibold  py-2 bg-green-500 dark:bg-green-250 rounded hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500 ${
            formik.isSubmitting && 'cursor-not-allowed opacity-60'
          } `}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default UpdateEmail;
