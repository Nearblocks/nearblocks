import { createContext } from 'react';

import { Wallet } from '@/components/app/wallet/near';

// Define the context type
interface NearContextType {
  signedAccountId: string; // Account ID as a string
  wallet: null | Wallet; // wallet can be null
}

// Create the context with default values
export const NearContext = createContext<NearContextType>({
  signedAccountId: '',
  wallet: null,
});
