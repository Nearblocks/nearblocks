import React from 'react';
import { toast } from 'react-toastify';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { request } from '@/hooks/useAuth';
import { catchErrors } from '@/utils/libs';
import Close from '../Icons/Close';

interface ApiKey {
  id: string;
  name: string;
  token: string;
  created_at: string;
  usage: string;
}

interface Props {
  mutate: () => void;
  onToggleDelete: () => void;
  isDeleteOpen: boolean;
  selected?: ApiKey | undefined;
}

const DeleteKey = ({
  mutate,
  onToggleDelete,
  isDeleteOpen,
  selected,
}: Props) => {
  const onDelete = async () => {
    try {
      await request.post(`/keys/${selected?.id}/delete`);
      if (!toast.isActive('delete-key')) {
        toast.success('Key Deleted', {
          toastId: 'delete-key',
        });
      }
      onToggleDelete();
      mutate();
    } catch (error) {
      const message = catchErrors(error);
      if (!toast.isActive('delete-key-error')) {
        toast.error(message, {
          toastId: 'delete-key-error',
        });
      }
    }
  };

  return (
    <DialogOverlay
      isOpen={isDeleteOpen}
      onDismiss={onToggleDelete}
      className="fixed bg-gray-600 bg-opacity-20 inset-0 z-30 flex items-center justify-center"
    >
      <DialogContent
        aria-label="Qr Code"
        className="w-full max-w-lg mx-auto bg-white dark:bg-black-600 dark:text-neargray-10 shadow-lg rounded-lg overflow-hidden"
      >
        <div className="flex items-center justify-between  px-6 pt-8">
          <h4 className="flex items-center text-sm break-all">
            Confirmation required
          </h4>
          <button
            className="text-gray-500 dark:text-neargray-10 fill-current"
            onClick={onToggleDelete}
          >
            <Close />
          </button>
        </div>
        <div className="px-6 pb-5 pt-2">
          <div className="py-2 pb-10">
            <p className="text-gray-600 dark:text-neargray-10 text-sm">
              Are you sure you wish to remove the APIKey {selected?.token} ?
            </p>
          </div>

          <div className="flex items-center justify-end  py-4">
            <p
              onClick={onToggleDelete}
              className="text-[13px] delay-300 duration-300 mx-1 hover:bg-gray-200 dark:hover:bg-black-200 px-3 py-2 rounded cursor-pointer"
            >
              Cancel
            </p>
            <button
              onClick={onDelete}
              className="text-[13px] text-white font-semibold px-3 py-2 bg-green-500 dark:bg-green-250 hover:-translate-y-1 hover:scale-100 duration-300 hover:shadow-md hover:shadow-green-500 rounded-md"
            >
              Remove
            </button>
          </div>
        </div>
      </DialogContent>
    </DialogOverlay>
  );
};

export default DeleteKey;
