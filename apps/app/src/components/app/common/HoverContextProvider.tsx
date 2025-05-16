'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { truncateString } from '@/utils/app/libs';
import { CopyButton } from '@/components/app/common/CopyButton';
import { usePathname } from '@/i18n/routing';
import { shortenText } from '@/utils/libs';

type AddressHoverContextType = {
  hoveredAddress: string | null;
  setHoveredAddress: (address: string | null) => void;
};

const AddressHoverContext = createContext<AddressHoverContextType | null>(null);

interface AddressHoverProviderProps {
  children: ReactNode;
}

export function AddressHoverProvider({ children }: AddressHoverProviderProps) {
  const [hoveredAddress, setHoveredAddress] = useState<string | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    setHoveredAddress(null);
  }, [pathname]);

  const value = {
    hoveredAddress,
    setHoveredAddress,
  };

  return (
    <AddressHoverContext.Provider value={value}>
      {children}
    </AddressHoverContext.Provider>
  );
}

const useAddressHover = () => {
  const context = useContext(AddressHoverContext);
  if (!context) {
    throw new Error('useAddressHover must be used within AddressHoverProvider');
  }
  return context;
};

interface Props {
  currentAddress?: string;
  txnHash?: string;
  className?: string;
  href?: string;
  name?: string;
  copy?: boolean;
  noHover?: boolean;
}

export function AddressOrTxnsLink({
  currentAddress,
  txnHash,
  className = '',
  href = '',
  name = '',
  copy = false,
  noHover = false,
}: Props) {
  const { hoveredAddress, setHoveredAddress } = useAddressHover();

  const isHovered = hoveredAddress === currentAddress;
  const displayText = name
    ? name
    : txnHash
    ? truncateString(txnHash, 17, '...')
    : currentAddress && shortenText(currentAddress);
  const linkHref = href
    ? href
    : txnHash
    ? `/txns/${txnHash}`
    : `/address/${currentAddress}`;

  const textToCopy = txnHash ? txnHash : currentAddress;

  return (
    <div className="inline-flex items-center">
      <Link
        href={linkHref}
        className={`
          text-green-500 dark:text-green-250 
          font-medium
          ${!txnHash && !noHover && 'p-0.5 px-1 border rounded-md'}
          ${className}
          ${
            !txnHash && !noHover && isHovered
              ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
              : 'border-transparent'
          }
        `}
        onMouseEnter={() =>
          !txnHash &&
          !noHover &&
          currentAddress &&
          setHoveredAddress(currentAddress)
        }
        onMouseLeave={() => !txnHash && !noHover && setHoveredAddress(null)}
      >
        {displayText}
      </Link>
      {copy && textToCopy && <CopyButton textToCopy={textToCopy} />}
    </div>
  );
}
