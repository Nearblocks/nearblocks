import React, { useEffect, useState } from 'react'
import { SwapWidget } from '@ref-finance/ref-sdk';
import { SwapState } from '@ref-finance/ref-sdk/dist/swap-widget/types';


const Widget = () => {

  const accountId=null
  
  const [swapState, setSwapState] = useState<SwapState>(
    null
  );
  const [tx, setTx] = useState<string | undefined>(undefined);

  useEffect(() => {
    const errorCode = new URLSearchParams(window.location.search).get(
      'errorCode'
    );

    const transactions = new URLSearchParams(window.location.search).get(
      'transactionHashes'
    );

    const lastTX = transactions?.split(',').pop();

    setTx(lastTX);

    setSwapState(!!errorCode ? 'fail' : !!lastTX ? 'success' : null);

    window.history.replaceState(
      {},
      '',
      window.location.origin + window.location.pathname
    );
  }, []);

  const onConnect = () => {
    
  };

  const onDisConnect = async () => {
   
  };

  const onSwap= async (transactionsRef: any[]): Promise<void> => {
    try {
      // Perform your asynchronous operations here
      console.log(transactionsRef);
      // Example of async operation
      } catch (error) {
      console.error('Error processing transactions:', error);
    }
  };
  return (
    <SwapWidget
      onSwap={onSwap}
      onDisConnect={onDisConnect}
      width={'400px'}
      connection={{
        AccountId: accountId || '',
        isSignedIn: !!accountId,
      }}
      transactionState={{
        state: swapState,
        setState: setSwapState,
        tx,
        detail: '(success details show here)',
      }}
      enableSmartRouting={true}
      onConnect={onConnect}
      defaultTokenIn={'wrap.testnet'}
      defaultTokenOut={'ref.fakes.testnet'}
    />
  );
}
export default Widget