import { useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { DialogCloseTrigger, DialogContent } from '@/components/ui/dialog';
import { request } from '@/hooks/app/useAuth';
import { currentCampaign } from '@/utils/types';

type Props = {
  currentCampaign: currentCampaign | null;
  mutate: () => void;
};

const ConfirmModal = ({ currentCampaign, mutate }: Props) => {
  const [buttonLoading, setButtonLoading] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  const onSubmit = async () => {
    try {
      setButtonLoading(true);
      await request.post(`publisher/campaign/${currentCampaign?.id}/approve`);
      if (!toast.isActive('campaign-approved')) {
        toast.success('The campaign has been approved successfully', {
          toastId: 'campaign-approved',
        });
      }
      mutate();
    } catch (error: any) {
      if (!toast.isActive('campaign-approve-error')) {
        toast.error(error?.response?.data, {
          toastId: 'campaign-approve-error',
        });
      }
    } finally {
      setButtonLoading(false);
      closeButton.current?.click();
    }
  };
  return (
    <>
      <DialogContent className="w-full max-w-lg mx-auto bg-white dark:bg-black-600 dark:text-neargray-10 shadow-lg rounded-lg overflow-hidden px-4 md:px-0">
        <div className="flex items-center justify-between  px-6 pt-8">
          <h4 className="flex items-center text-sm break-all">
            Confirm Campaign Approval
          </h4>
        </div>
        <div className="px-6 pb-5 pt-2">
          <div className="py-2 pb-10">
            <p className="text-gray-600 dark:text-neargray-10 text-sm">
              Are you sure you want to approve this campaign?{' '}
            </p>
          </div>
          <div className="flex items-center justify-end  py-4">
            <p
              className="text-[13px] hover:delay-300 hover:duration-300 mx-1 hover:bg-gray-200 dark:hover:bg-black-200 px-4 py-2 cursor-pointer rounded"
              onClick={() => closeButton.current?.click()}
            >
              Cancel
            </p>
            <button
              className={`text-sm text-[13px] px-4 focus:outline-none text-white text-center font-semibold py-2 bg-green-500 rounded transition ease-in-out delay-150 ${
                buttonLoading
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:-translate-y-1 hover:scale-100 hover:shadow-md hover:shadow-green-500'
              }`}
              disabled={buttonLoading}
              onClick={onSubmit}
            >
              {buttonLoading ? 'Loading...' : 'Submit'}
            </button>
          </div>
        </div>
        <DialogCloseTrigger
          className="text-gray-500 fill-current"
          ref={closeButton}
        />
      </DialogContent>
    </>
  );
};
export default ConfirmModal;
