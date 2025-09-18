'use client';

import { useErrorBoundary } from 'react-error-boundary';

interface Props {
  icons: any | SVGElement;
  message: string;
  mutedText: string;
  reset?: any;
  errorBg?: boolean;
}
const ErrorMessage = ({ icons, message, mutedText, reset, errorBg }: Props) => {
  const { resetBoundary } = useErrorBoundary();

  return (
    <div className="text-center items-center py-24 text-nearblue-600 dark:text-neargray-10  text-sm font-normal">
      <div className="mb-4 flex justify-center">
        <span
          className={`inline-block border  border-opacity-25 bg-opacity-10  rounded-full p-4 ${
            errorBg
              ? 'bg-red-300 border-red-600 text-red-500'
              : 'bg-yellow-300 border-yellow-600 text-yellow-500'
          }`}
        >
          {icons}
        </span>
      </div>

      <h3 className="font-semibold text-lg text-nearblue-600 dark:text-neargray-10">
        {message}
      </h3>

      <p className="mb-0 py-1 font-semibold break-words px-2">{mutedText}</p>

      {reset && (
        <button
          className="mx-3 px-3.5 mr-1 bg-green dark:bg-green-250 dark:text-neargray-10 py-1.5 text-xs font-medium rounded-md text-white"
          onClick={() => resetBoundary()}
        >
          Retry
        </button>
      )}
    </div>
  );
};
export default ErrorMessage;
