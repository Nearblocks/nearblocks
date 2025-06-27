'use client';
import { ReactNode, useState } from 'react';
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import ListCheck from '@/components/app/Icons/ListCheck';
import ArrowDown from '@/components/app/Icons/ArrowDown';

const ActionMenuPopover = ({
  children,
  positionClass,
  disabled,
}: {
  children: ReactNode;
  positionClass?: string;
  disabled?: boolean;
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <PopoverRoot
      positioning={{ sameWidth: true }}
      onOpenChange={() => setIsPopoverOpen((prev) => !prev)}
    >
      <PopoverTrigger
        asChild
        className="md:flex justify-center text-nearblue-600 dark:text-neargray-10 hover:no-underline px-2 py-1"
      >
        <button
          disabled={disabled}
          className={`dark:bg-black-200 rounded-md border dark:border-gray-800 flex items-center ${
            isPopoverOpen
              ? 'bg-gray-100 dark:hover:bg-black-200 dark:bg-black-200'
              : 'bg-white dark:bg-black-600 hover:bg-gray-100 dark:hover:bg-black-200'
          }`}
        >
          <span className="flex items-center">
            <ListCheck className="h-5 w-5" />
            <ArrowDown className="h-4 w-4" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={`bg-white max-w-min -mt-1 !rounded-md shadow border z-10 dark:border-gray-800 dark:bg-black overflow-visible p-1.5 ${
          positionClass ? positionClass : 'md:right-0'
        }`}
        style={{ position: 'absolute', transform: 'translateX(0)' }}
      >
        {children}
      </PopoverContent>
    </PopoverRoot>
  );
};

export default ActionMenuPopover;
