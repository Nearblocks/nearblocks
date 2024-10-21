import { DialogOverlay, DialogContent } from '@reach/dialog';
import { toast } from 'react-toastify';
import { useState } from 'react';
import Close from '@/components/Icons/Close';
import { currentCampaign } from '@/utils/types';

type Props = {
  setConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentCampaign: currentCampaign | null;
  mutate: () => void;
  handleCampaignCancellation: () => Promise<void>;
  buttonLoading: boolean;
  setButtonLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const ConfirmModal = ({
  setConfirmOpen,
  handleCampaignCancellation,
}: Props) => {
  const [buttonLoading, setButtonLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setButtonLoading(true);
      await handleCampaignCancellation();
      if (!toast.isActive('campaign-cancelled')) {
        toast.success('Campaign cancelled successfully!', {
          toastId: 'campaign-cancelled',
        });
      }
      setConfirmOpen(false);
    } catch (error) {
      if (!toast.isActive('campaign-cancelled-error')) {
        toast.error('Failed to cancel campaign', {
          toastId: 'campaign-cancelled-error',
        });
      }
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <>
      <DialogOverlay className="fixed bg-gray-600 bg-opacity-20 inset-0 z-30 flex items-center justify-center">
        <DialogContent className="w-full max-w-lg mx-auto bg-white dark:bg-black-600 dark:text-neargray-10 shadow-lg rounded-lg overflow-hidden px-4 md:px-0">
          <div className="flex items-center justify-between  px-6 pt-8">
            <h4 className="flex items-center text-sm break-all">
              Confirm Campaign Canceling
            </h4>
            <button
              className="text-gray-600 dark:text-neargray-10 fill-current"
              onClick={() => setConfirmOpen(false)}
            >
              <Close />
            </button>
          </div>
          <div className="px-6 pb-5 pt-2">
            <div className="py-2 pb-10">
              <p className="text-gray-600 dark:text-neargray-10 text-sm">
                Are you sure you want to cancel this campaign? Canceling this
                campaign will also cancel your subscription!
              </p>
            </div>
            <div className="flex items-center justify-end  py-4">
              <p
                onClick={() => setConfirmOpen(false)}
                className="text-[13px] hover:delay-300 hover:duration-300 mx-1 dark:text-neargray-10 hover:bg-gray-200 dark:hover:bg-black-200 px-4 py-2 rounded cursor-pointer"
              >
                Cancel
              </p>
              <button
                onClick={onSubmit}
                className={`text-sm text-[13px] px-4 focus:outline-none text-white text-center font-semibold py-2 bg-green-500 rounded transition ease-in-out delay-150 ${
                  buttonLoading
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:-translate-y-1 hover:scale-100 hover:shadow-md hover:shadow-green-500'
                }`}
                disabled={buttonLoading}
              >
                {buttonLoading ? 'Loading...' : 'Submit'}
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogOverlay>
    </>
  );
};
export default ConfirmModal;
