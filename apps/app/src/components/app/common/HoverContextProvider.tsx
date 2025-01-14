'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import CopyIcon from '@/components/app/Icons/CopyIcon';
import Link from 'next/link';
import { truncateString } from '@/utils/app/libs';

import Clipboard from 'clipboard';
import Tick from '@/components/app/Icons/Tick';

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

interface AddressDisplayProps {
  currentAddress: string;
  className?: string;
  href?: string;
  name?: string;
  copy?: boolean;
}

export function AddressDisplay({
  href = '',
  currentAddress,
  className = '',
  name = '',
  copy = false,
}: AddressDisplayProps) {
  const { hoveredAddress, setHoveredAddress } = useAddressHover();
  const [isCopied, setIsCopied] = useState(false);

  const copyButtonRef = useRef<HTMLButtonElement>(null);

  const isHovered = hoveredAddress === currentAddress;

  const handleMouseEnter = () => {
    setHoveredAddress(currentAddress);
  };

  const handleMouseLeave = () => {
    setHoveredAddress(null);
  };
  useEffect(() => {
    if (!copyButtonRef.current) return;

    const clipboard = new Clipboard(copyButtonRef.current, {
      text: () => currentAddress,
    });

    clipboard.on('success', () => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    });

    return () => {
      clipboard.destroy();
    };
  }, [currentAddress]);

  return (
    <div className="flex items-center">
      <Link
        href={href ? href : `/address/${currentAddress}`}
        className={`text-green-500 dark:text-green-250 font-semibold transition-colors p-0.5 px-1 rounded-md 
     ${className ? className : ''}
     ${isHovered && 'bg-amber border-amber  border-dashed'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {name ? name : truncateString(currentAddress, 17, '...')}
      </Link>
      {copy && (
        <button
          ref={copyButtonRef}
          className="dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1 w-5 h-5 group-hover:text-white"
          type="button"
        >
          {isCopied ? (
            <Tick className="fill-current text-green-500 h-4 w-4" />
          ) : (
            <CopyIcon className="fill-current -z-50 text-gray-500 dark:text-green-250 hover:text-green h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
