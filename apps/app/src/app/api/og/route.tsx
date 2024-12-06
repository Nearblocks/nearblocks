import { ImageResponse } from 'next/og';
import { format } from 'numerable';

import { thumbnailAccountSvg } from '@/components/thumbnail/ThumbnailAccount';
import { thumbnailBasicSvg } from '@/components/thumbnail/ThumbnailBasic';
import { thumbnailBlockSvg } from '@/components/thumbnail/ThumbnailBlock';
import { thumbnailLogoBottom } from '@/components/thumbnail/ThumbnailLogoBottom';
import { thumbnailLogoTop } from '@/components/thumbnail/ThumbnailLogoTop';
import { thumbnailTokenSvg } from '@/components/thumbnail/ThumbnailToken';
import { thumbnailTransactionSvg } from '@/components/thumbnail/ThumbnailTransaction';
import { config } from '@/config/brandConfig';

function truncateString(str: string, startChars = 6, endChars = 4) {
  if (str.length <= startChars + endChars) return str;
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}

function svgToBase64(svgString: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
    'base64',
  )}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'Near blocks';
  const basic = url.searchParams.has('basic');
  const account = url.searchParams.has('account');
  const blockHash = url.searchParams.has('blockHash');
  const token = url.searchParams.has('token');
  const nft = url.searchParams.has('nft');

  const transaction = url.searchParams.has('transaction');
  const home = url.searchParams.has('home');

  const blockHeight = url.searchParams.get('block_height');
  const transactionHash = url.searchParams.get('transaction_hash');
  const blobHash = url.searchParams.get('blob_hash');
  const addressHash = url.searchParams.get('address');
  const tokenHash = url.searchParams.get('tokenHash');
  const nftHash = url.searchParams.get('nftHash');

  const brand = 'near';
  const brandConfig = config(brand);

  let svgString;
  if (basic) {
    svgString = thumbnailBasicSvg(brandConfig);
  } else if (account) {
    svgString = thumbnailAccountSvg(brandConfig);
  } else if (blockHash) {
    svgString = thumbnailBlockSvg(brandConfig);
  } else if (token) {
    svgString = thumbnailTokenSvg(brandConfig);
  } else if (nft) {
    svgString = thumbnailTokenSvg(brandConfig);
  } else if (transaction) {
    svgString = thumbnailTransactionSvg(brandConfig);
  } else if (home) {
    svgString = thumbnailBasicSvg(brandConfig);
  } else {
    svgString = thumbnailBasicSvg(brandConfig);
  }

  const backgroundImage = svgToBase64(svgString);

  const topLogo = svgToBase64(thumbnailLogoTop());
  const bottomLogo = svgToBase64(thumbnailLogoBottom());

  let titleText = title;
  if (blockHash) {
    titleText = `${
      brand.charAt(0).toUpperCase() + brand.slice(1)
    } Block Height`;
  } else if (basic) {
    titleText = `${title}`;
  } else if (transaction && transactionHash) {
    titleText = `${brand.charAt(0).toUpperCase() + brand.slice(1)} Transaction`;
  } else if (transaction && blobHash) {
    titleText = `${brand.charAt(0).toUpperCase() + brand.slice(1)} Blob`;
  } else if (account && addressHash) {
    titleText = `${brand.charAt(0).toUpperCase() + brand.slice(1)} Account`;
  } else if (token && tokenHash) {
    titleText = `${brand.charAt(0).toUpperCase() + brand.slice(1)} Token`;
  } else if (nft && nftHash) {
    titleText = `${brand.charAt(0).toUpperCase() + brand.slice(1)} NFT Token`;
  }

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          color: 'white',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {!home && topLogo && (
          // eslint-disable-next-line
          <img
            src={topLogo}
            style={{
              height: '50px',
              margin: '10px',
              position: 'absolute',
              right: 0,
              top: 0,
            }}
          />
        )}
        {home && bottomLogo && (
          // eslint-disable-next-line
          <img
            src={bottomLogo}
            style={{
              bottom: '50%',
              height: '110px',
              left: '50%',
              position: 'absolute',
              transform: 'translate(-50%, 50%)',
            }}
          />
        )}
        {!home && bottomLogo && (
          // eslint-disable-next-line
          <img
            src={bottomLogo}
            style={{
              bottom: 0,
              height: '50px',
              left: 0,
              margin: '10px',
              position: 'absolute',
            }}
          />
        )}

        {!home && (
          <div
            style={{
              alignItems: basic || home ? 'center' : 'flex-start',
              display: 'flex',
              flexDirection: 'column',
              fontSize: basic || home ? 40 : 25,
              position: 'relative',
              right: basic || home ? '' : '150px',
              textAlign: basic || home ? 'center' : 'left',
              top: basic || home ? '' : 50,
              zIndex: 1,
            }}
          >
            <div>{titleText}</div>

            {blockHash && blockHeight && (
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  marginTop: '10px',
                }}
              >
                {format(blockHeight, '0,0.#####')}
              </div>
            )}

            {transaction && transactionHash && (
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  marginTop: '10px',
                }}
              >
                {truncateString(transactionHash)}
              </div>
            )}

            {transaction && blobHash && (
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  marginTop: '10px',
                }}
              >
                {truncateString(blobHash)}
              </div>
            )}

            {account && addressHash && (
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  marginTop: '10px',
                }}
              >
                {truncateString(addressHash)}
              </div>
            )}

            {token && tokenHash && (
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  marginTop: '10px',
                }}
              >
                {truncateString(tokenHash)}
              </div>
            )}

            {nft && nftHash && (
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  marginTop: '10px',
                }}
              >
                {truncateString(nftHash)}
              </div>
            )}
          </div>
        )}
      </div>
    ),
    {
      height: 405,
      width: 720,
    },
  );
}
