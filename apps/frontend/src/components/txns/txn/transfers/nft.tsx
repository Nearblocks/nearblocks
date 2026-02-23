import { TxnNFT } from 'nb-schemas';

import { Link } from '@/components/link';
import { NFTMedia, TokenImage, TokenLink } from '@/components/token';
import { ScrollArea } from '@/ui/scroll-area';

import { TransferSummary } from './transfer';

type Props = {
  nfts: TxnNFT[];
};

export const NFTTransfers = ({ nfts }: Props) => {
  const displayNfts = nfts.filter(
    (nft) => nft.delta_amount > 0 || nft.involved_account_id === null,
  );

  return (
    <ScrollArea className="max-h-44">
      <div className="flex flex-col gap-3">
        {displayNfts.map((nft, i) => (
          <div className="flex items-center gap-2" key={i}>
            <Link
              className="text-link size-11"
              href={`/nft-token/${nft.contract_account_id}/${nft.token_id}`}
            >
              <NFTMedia
                alt={nft.token_meta?.title ?? nft.token_id}
                base={nft.meta?.base_uri}
                className="m-px size-11 rounded-lg border"
                media={nft.token_meta?.media}
                reference={nft.token_meta?.reference}
              />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span>Token</span>
                <Link
                  className="text-link"
                  href={`/nft-token/${nft.contract_account_id}/${nft.token_id}`}
                >
                  {nft.token_id}
                </Link>
                <TokenImage
                  alt={nft.token_meta?.title ?? nft.meta?.name ?? ''}
                  className="m-px size-5 rounded-full border"
                  src={nft.token_meta?.media ?? nft.meta?.icon ?? ''}
                />
                <TokenLink
                  contract={nft.contract_account_id}
                  name={nft.meta?.name}
                  symbol={nft.meta?.symbol}
                  type="nft-tokens"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <TransferSummary
                  affected={nft.affected_account_id}
                  cause={nft.cause}
                  involved={nft.involved_account_id}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
