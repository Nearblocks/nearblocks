'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Check from '@/components/app/Icons/Check';
import Rpc from '@/components/app/Icons/Rpc';
import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRpcProvider } from '@/components/app/common/RpcContext';
import Delete from '../Icons/Delete';
import ArrowDownDouble from '../Icons/ArrowDownDouble';
import useScrollToTop from '@/hooks/app/useScrollToTop';
import { useTranslations } from 'next-intl';
import { RpcProvider } from '@/utils/types';

const RpcMenu = ({ positionClass }: { positionClass?: string }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);

  const {
    rpc: currentRpcUrl,
    setRpc,
    providers: rpcProviders,
    addCustomRpc,
    deleteCustomRpc,
  } = useRpcProvider();

  const enableScroll = rpcProviders.length > 6;
  const t = useTranslations();

  const { isAtBottom, scrollToTop } = useScrollToTop(
    enableScroll ? scrollContainerRef : null,
  );

  const validationSchema = useMemo(() => {
    return Yup.object({
      name: Yup.string()
        .trim()
        .required(t('validation.required', { field: 'RPC name' }))
        .test(
          'unique-name',
          t('validation.exists', { field: 'RPC name' }),
          function (value: string | undefined): boolean | Yup.ValidationError {
            const { path, createError } = this;
            if (
              value &&
              rpcProviders.some(
                (provider: RpcProvider) =>
                  provider.name.toLowerCase() === value.trim().toLowerCase(),
              )
            ) {
              return createError({
                path,
                message: t('validation.exists', { field: 'RPC name' }),
              });
            }
            return true;
          },
        ),

      url: Yup.string()
        .trim()
        .required(t('validation.required', { field: 'RPC URL' }))
        .url(t('validation.rpcUrlFormat'))
        .test(
          'unique-url',
          t('validation.exists', { field: 'URL' }),
          function (value: string | undefined): boolean | Yup.ValidationError {
            const { path, createError } = this;
            if (
              value &&
              rpcProviders.some(
                (provider: RpcProvider) => provider.url === value.trim(),
              )
            ) {
              return createError({
                path,
                message: t('validation.exists', { field: 'URL' }),
              });
            }
            return true;
          },
        ),
    });
  }, [rpcProviders, t]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      if (popoverTriggerRef.current && isPopoverOpen) {
        popoverTriggerRef.current.focus();
      }
    }, 100);
  }, [isPopoverOpen]);

  const formConfig = useMemo(
    () => ({
      initialValues: {
        name: '',
        url: '',
      },
      validationSchema,
      validateOnBlur: false,
      validateOnChange: false,
      onSubmit: (
        values: RpcProvider,
        { resetForm }: FormikHelpers<RpcProvider>,
      ) => {
        const trimmedName = values.name.trim();
        const trimmedUrl = values.url.trim();
        addCustomRpc({
          name: trimmedName,
          url: trimmedUrl,
        });
        setRpc(trimmedUrl);
        handleModalClose();
        resetForm();
      },
    }),
    [validationSchema, addCustomRpc, setRpc, handleModalClose],
  );

  return (
    <div className="relative group flex">
      <PopoverRoot
        positioning={{ sameWidth: true }}
        open={isPopoverOpen}
        onOpenChange={({ open }: { open: boolean }) => {
          setIsPopoverOpen((prev) => !prev);
          if (open && enableScroll && scrollContainerRef.current) {
            setTimeout(() => {
              const el = scrollContainerRef.current!;
              if (el) {
                el.scrollTo({ top: 0, behavior: 'auto' });
                if (el.scrollTop + el.clientHeight < el.scrollHeight) {
                  el.dispatchEvent(new Event('scroll', { bubbles: true }));
                }
              }
            }, 0);
          }
        }}
      >
        <PopoverTrigger
          asChild
          className="md:flex justify-center w-full hover:text-green-500 dark:hover:text-green-250 text-nearblue-600 dark:text-neargray-10 hover:no-underline px-0 py-1 "
        >
          <button
            ref={popoverTriggerRef}
            className={`border px-2.5 py-1.5 cursor-pointer focus:outline-none flex items-center rounded-md text-nearblue-600 dark:text-neargray-10 dark:border-gray-800 ${
              isPopoverOpen
                ? 'bg-gray-100 dark:bg-black-200'
                : 'bg-white dark:bg-black-600 hover:bg-gray-100 dark:hover:bg-black-200'
            }`}
          >
            <Rpc className="h-4 w-4 dark:text-neargray-10" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className={`bg-white w-44 -mt-1 md:left-auto rounded-md soft-shadow border z-10 dark:border-gray-800 dark:bg-black overflow-visible ${
            positionClass ? positionClass : 'md:right-0'
          } `}
          style={{
            position: 'absolute',
            transform: 'translateX(0)',
          }}
        >
          <ul>
            <li className="flex px-3 py-0.5 justify-between items-center w-full border-b dark:border-black-200">
              <span className="flex font-medium text-sm text-gray-700 dark:text-gray-300">
                RPC
              </span>
              <DialogRoot
                placement={'center'}
                size="xs"
                open={isModalOpen}
                onOpenChange={({ open }: { open: boolean }) => {
                  if (!open) {
                    handleModalClose();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <button
                    className="flex items-center text-2xl focus:outline-none text-green-500 dark:text-green-250 hover:text-green-600 dark:hover:text-green-300"
                    onClick={() => setIsModalOpen(true)}
                  >
                    +
                  </button>
                </DialogTrigger>
                <DialogContent
                  className="flex items-center justify-center mx-5"
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (e.target === e.currentTarget) {
                      handleModalClose();
                    }
                  }}
                >
                  <div className="bg-white dark:bg-black-200 dark:text-neargray-10 dark:border-black-200 w-full rounded-lg">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-black-200 px-3 py-4 rounded-t-lg">
                      {t('rpcMenu.addCustomRpc')}
                    </h2>
                    <div className="p-4 dark:bg-black-600 rounded-b-md">
                      <Formik {...formConfig}>
                        <Form>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('rpcMenu.rpcName')}
                            </label>
                            <Field
                              name="name"
                              type="text"
                              placeholder={t('rpcMenu.enterRpcName')}
                              autoComplete="off"
                              className="w-full h-9 px-3 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onKeyDown={(
                                e: React.KeyboardEvent<HTMLInputElement>,
                              ) => {
                                if (e.key === '/') {
                                  e.stopPropagation();
                                }
                              }}
                            />
                            <ErrorMessage
                              name="name"
                              component="p"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              RPC URL
                            </label>
                            <Field
                              name="url"
                              type="text"
                              placeholder={t('rpcMenu.enterRpcUrl')}
                              autoComplete="off"
                              className="w-full h-9 px-3 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onKeyDown={(
                                e: React.KeyboardEvent<HTMLInputElement>,
                              ) => {
                                if (e.key === '/') {
                                  e.stopPropagation();
                                }
                              }}
                            />
                            <ErrorMessage
                              name="url"
                              component="p"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-black-200 dark:hover:bg-black-100 hover:bg-gray-300 rounded-md transition-colors"
                              onClick={handleModalClose}
                            >
                              {t('rpcMenu.cancel')}
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-green-500 dark:bg-green-250 dark:text-neargray-10 hover:bg-green-400 dark:hover:bg-green-300 text-white text-xs focus:outline-none rounded-md"
                            >
                              {t('rpcMenu.add')}
                            </button>
                          </div>
                        </Form>
                      </Formik>
                    </div>
                  </div>
                  <DialogCloseTrigger
                    className="text-gray-500 dark:text-gray-300 fill-current"
                    onClick={handleModalClose}
                  />
                </DialogContent>
              </DialogRoot>
            </li>
            <div>
              <div
                ref={scrollContainerRef}
                className={`break-words mostly-customized-scrollbar ${
                  enableScroll
                    ? 'max-h-[180px] overflow-y-auto focus:outline-none'
                    : ''
                }`}
              >
                {rpcProviders.map((provider) => (
                  <li
                    key={provider.url}
                    className={`flex justify-between items-center text-xs px-4 py-2 m-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-black-200 hover:text-green-400 dark:hover:text-green-250 text-nearblue-600 dark:text-neargray-10 rounded-md ${
                      provider.url === currentRpcUrl
                        ? 'bg-gray-100 dark:bg-black-200 text-green-500 dark:!text-green-250'
                        : ''
                    }`}
                    onClick={() => setRpc(provider.url)}
                  >
                    <span className="whitespace-nowrap max-w-[105px] overflow-hidden text-ellipsis">
                      {provider.name}
                    </span>
                    <div className="flex gap-x-4 ml-2 justify-center items-center flex-shrink-0">
                      {provider.url === currentRpcUrl && (
                        <Check className="w-3 h-3 text-green-500 dark:text-green-250" />
                      )}
                      {provider.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCustomRpc(provider.url);
                          }}
                          title={t('rpcMenu.deleteCustomRpc')}
                          className="text-red-600 dark:text-red-400 w-3 h-3"
                        >
                          <Delete />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </div>
              {enableScroll && (
                <div className="border-t dark:border-black-200 px-3 py-2 bg-white dark:bg-black">
                  {!isAtBottom ? (
                    <div className="flex items-center justify-center text-xs text-nearblue-600 dark:text-neargray-10">
                      <ArrowDownDouble className="w-4 h-4 mr-1 dark:invert" />
                      {t('scrollForMore')}
                    </div>
                  ) : (
                    <button
                      className="flex items-center justify-center text-xs text-nearblue-600 dark:text-neargray-10 hover:text-green-500 dark:hover:text-green-250 w-full"
                      onClick={() => scrollToTop()}
                    >
                      <ArrowDownDouble
                        className="w-4 h-4 mr-1 dark:invert"
                        style={{ transform: 'rotate(180deg)' }}
                      />
                      {t('scrollToTop')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </ul>
        </PopoverContent>
      </PopoverRoot>
    </div>
  );
};

export default RpcMenu;
