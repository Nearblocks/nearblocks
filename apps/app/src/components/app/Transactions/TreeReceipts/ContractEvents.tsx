import { AddressOrTxnsLink } from '../../common/HoverContextProvider';
import Link from 'next/link';
import FaRight from '../../Icons/FaRight';
import IntentsIcon from '../../Icons/IntentsIcon';
import TokenInfo from '../../common/TokenInfo';

export default function ContractEvents({
  action,
  hash,
}: {
  action: any;
  hash: string;
}) {
  const sentTokens = action?.sent || action?.swaps?.[0]?.sent || [];
  const receivedTokens = action?.received || action?.swaps?.[0]?.received || [];
  const accountId = action?.swaps?.[0]?.accountId;

  const token = action?.tokens?.[0];
  const label = action?.label || action?.type;
  const sender = action?.sender;
  const receiptId = action?.receiptId;
  const contract = action?.contract;
  const senderLabel = action?.roles?.senderLabel;
  const receiverLabel = action?.roles?.receiverLabel;

  const TransferData =
    (sentTokens.length > 0 || receivedTokens.length > 0) && label === 'Swap';

  return (
    <div className="flex items-center space-x-1 text-sm text-gray-800 dark:text-gray-200">
      {receiptId && hash ? (
        <Link href={`/txns/${hash}#execution#${receiptId}`}>
          <FaRight className="text-gray-400 cursor-pointer text-xs" />
        </Link>
      ) : (
        <FaRight className="text-gray-400 text-xs" />
      )}

      {((action?.receiver && label !== 'Deposit') ||
        (label === 'Swap' && accountId)) && (
        <AddressOrTxnsLink
          className="text-green-500 dark:text-green-250 font-normal"
          currentAddress={action.receiver || accountId}
        />
      )}
      {label && <span className="font-semibold text-gray pl-1">{label}</span>}

      {TransferData ? (
        <>
          {sentTokens?.map((token: any, i: number) => (
            <TokenInfo
              key={`sent-${i}`}
              contract={token.token}
              amount={token.amount}
              isShowText
              metaInfo={[token.meta]}
            />
          ))}

          {receivedTokens?.map((token: any, i: number) => (
            <TokenInfo
              key={`recv-${i}`}
              contract={token.token}
              amount={token.amount}
              isShowText
              metaInfo={[token.meta]}
            />
          ))}
        </>
      ) : (
        token?.token && (
          <TokenInfo
            contract={token.token}
            amount={token.amount}
            isShowText
            metaInfo={[token.meta]}
          />
        )
      )}

      <div className="flex items-center pl-0.5">
        {senderLabel && (
          <>
            <span className="font-bold text-gray text-sm sm:text-xs mr-1">
              <span className="ml-1">{senderLabel}</span>
            </span>

            {action?.label === 'Withdraw' ? (
              <>
                <IntentsIcon className="h-4 w-4 ml-1" />
                <AddressOrTxnsLink
                  currentAddress={contract}
                  className="text-green-500 dark:text-green-250 font-normal hover:no-underline flex items-center ml-0.5 h-6"
                />
              </>
            ) : (
              <AddressOrTxnsLink
                currentAddress={sender}
                className="text-green-500 dark:text-green-250 font-normal hover:no-underline flex items-center ml-0.5 h-6"
              />
            )}
          </>
        )}

        {receiverLabel && contract && (
          <>
            <span className="ml-1">{receiverLabel}</span>
            <IntentsIcon className="h-4 w-4 ml-1" />
            <AddressOrTxnsLink
              currentAddress={contract}
              className="text-green-500 dark:text-green-250 font-normal hover:no-underline flex items-center ml-0.5 h-6"
            />
          </>
        )}
      </div>
    </div>
  );
}
