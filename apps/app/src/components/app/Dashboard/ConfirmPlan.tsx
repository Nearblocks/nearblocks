import React, { useRef } from 'react';

import { DialogCloseTrigger, DialogContent } from '@/components/ui/dialog';

interface Props {
  onContinue: (plan: any) => Promise<void>;
  plan: any;
}

const ConfirmPlan = ({ onContinue, plan }: Props) => {
  const closeButton = useRef<HTMLButtonElement>(null);
  return (
    <DialogContent
      aria-label="Qr Code"
      className="w-full max-w-lg mx-auto bg-white dark:bg-black-600 dark:text-neargray-10 shadow-lg rounded-lg overflow-hidden px-4 md:px-0"
    >
      <div className="flex items-center justify-between  px-6 pt-8">
        <h4 className="flex items-center text-sm break-all">
          Confirmation required
        </h4>
      </div>
      <div className="px-6 pb-5 pt-2">
        <div className="py-2 text-gray-600 dark:text-neargray-10 text-sm">
          You have selected the free plan. This will cancel your existing
          subscription. Would you like to continue?
        </div>
        <div className="flex items-center justify-end  py-4">
          <p
            className="text-[13px] hover:delay-300 hover:duration-300 mx-1 hover:bg-gray-200 dark:hover:bg-black-200 px-4 py-2 cursor-pointer rounded"
            onClick={() => closeButton.current?.click()}
          >
            Cancel
          </p>
          <button
            className="text-sm text-[13px] px-3 focus:outline-none text-white dark:text-neargray-10 text-center font-semibold py-2 bg-green-500 dark:bg-green-250 rounded transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500"
            onClick={() => onContinue(plan)}
            type="button"
          >
            Continue
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

export default ConfirmPlan;
