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

  const isGenericSwap =
    label === 'Swap' &&
    action.amountIn &&
    action.tokenIn &&
    action.amountOut &&
    action.tokenOut;

  const TransferData =
    (sentTokens.length > 0 || receivedTokens.length > 0) && label === 'Swap';

  return (
    <div className="flex items-center  text-sm text-gray-800 dark:text-gray-200">
      {receiptId && hash ? (
        <Link href={`/txns/${hash}#execution#${receiptId}`}>
          <FaRight className="text-gray-400 cursor-pointer text-xs mr-1" />
        </Link>
      ) : (
        <FaRight className="text-gray-400 text-xs mr-1" />
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
              contract={token.token || action.contract}
              amount={token.amount || action.amount}
              isShowText
              metaInfo={[token.meta]}
            />
          ))}
          <span className="font-bold text-gray text-sm sm:text-xs mr-1">
            <span className="ml-1">{senderLabel}</span>
          </span>
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
      ) : isGenericSwap ? (
        <>
          <TokenInfo
            contract={action.tokenIn}
            amount={action.amountIn}
            isShowText
            metaInfo={[action.tokenInMeta]}
          />
          <TokenInfo
            contract={action.tokenOut}
            amount={action.amountOut}
            isShowText
            metaInfo={[action.tokenOutMeta]}
          />
        </>
      ) : token?.token ? (
        <TokenInfo
          contract={token.token}
          amount={token.amount}
          isShowText
          metaInfo={[token.meta]}
        />
      ) : action?.contract && action?.amount ? (
        <TokenInfo
          contract={action.contract}
          amount={action.amount}
          isShowText
          metaInfo={[action.meta]}
        />
      ) : null}

      <div className="flex items-center pl-0.5">
        {senderLabel && action.type !== 'Swap' && (
          <>
            <span className="font-bold text-gray text-sm sm:text-xs mr-1">
              <span>{senderLabel}</span>
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
            <span>{receiverLabel}</span>
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
