import { ImageResponse } from 'next/og';
import { format } from 'numerable';
import { config } from '@/config/brandConfig';
import { thumbnailBasicSvg } from '@/components/thumbnail/ThumbnailBasic';
import { thumbnailAccountSvg } from '@/components/thumbnail/ThumbnailAccount';
import { thumbnailTokenSvg } from '@/components/thumbnail/ThumbnailToken';
import { thumbnailTransactionSvg } from '@/components/thumbnail/ThumbnailTransaction';
import { thumbnailBlockSvg } from '../../../components/thumbnail/ThumbnailBlock';
import path from 'path';
import { readFileSync } from 'fs';

function truncateString(str: string, startChars = 6, endChars = 4) {
  if (str.length <= startChars + endChars) return str;
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}

function svgToBase64(svgString: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svgString).toString(
    'base64',
  )}`;
}

function imageToBase64(filePath: string) {
  return `data:image/svg+xml;base64,${Buffer.from(
    readFileSync(filePath),
  ).toString('base64')}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'Near blocks';
  const basic = url.searchParams.has('basic');
  const account = url.searchParams.has('account');
  const block = url.searchParams.has('block');
  const token = url.searchParams.has('token');
  const nft = url.searchParams.has('nft');

  const transaction = url.searchParams.has('transaction');
  const home = url.searchParams.has('home');

  const blockHeight = url.searchParams.get('block_height');
  const transactionHash = url.searchParams.get('transaction_hash');
  const blobHash = url.searchParams.get('blob_hash');
  const addressHash = url.searchParams.get('address');
  const tokenHash = url.searchParams.get('token');
  const nftHash = url.searchParams.get('nft');

  const brand = 'near';
  const brandConfig = config(brand);

  let svgString;
  if (basic) {
    svgString = thumbnailBasicSvg(brandConfig);
  } else if (account) {
    svgString = thumbnailAccountSvg(brandConfig);
  } else if (block) {
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

  const topLogoPath = path.resolve(process.cwd(), brandConfig.topLogo);
  const bottomLogoPath = path.resolve(process.cwd(), brandConfig.bottomLogo);
  const topLogo = brandConfig.topLogo ? imageToBase64(topLogoPath) : null;
  const bottomLogo = brandConfig.bottomLogo
    ? imageToBase64(bottomLogoPath)
    : null;

  let titleText = title;
  if (block && blockHeight) {
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
          display: 'flex',
          color: 'white',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {!home && topLogo && (
          // eslint-disable-next-line
          <img
            src={topLogo}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              height: '50px',
              margin: '10px',
            }}
          />
        )}
        {home && bottomLogo && (
          // eslint-disable-next-line
          <img
            src={bottomLogo}
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '50%',
              transform: 'translate(-50%, 50%)',
              height: '110px',
            }}
          />
        )}
        {!home && bottomLogo && (
          // eslint-disable-next-line
          <img
            src={bottomLogo}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '50px',
              margin: '10px',
            }}
          />
        )}

        {!home && (
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: basic || home ? 'center' : 'flex-start',
              textAlign: basic || home ? 'center' : 'left',
              fontSize: basic || home ? 40 : 25,
              top: basic || home ? '' : 50,
              right: basic || home ? '' : '150px',
            }}
          >
            <div>{titleText}</div>

            {block && blockHeight && (
              <div
                style={{
                  marginTop: '10px',
                  fontWeight: 700,
                  fontSize: 40,
                }}
              >
                {format(blockHeight, '0,0.#####')}
              </div>
            )}

            {transaction && transactionHash && (
              <div
                style={{
                  marginTop: '10px',
                  fontWeight: 700,
                  fontSize: 40,
                }}
              >
                {truncateString(transactionHash)}
              </div>
            )}

            {transaction && blobHash && (
              <div
                style={{
                  marginTop: '10px',
                  fontWeight: 700,
                  fontSize: 40,
                }}
              >
                {truncateString(blobHash)}
              </div>
            )}

            {account && addressHash && (
              <div
                style={{
                  marginTop: '10px',
                  fontWeight: 700,
                  fontSize: 40,
                }}
              >
                {truncateString(addressHash)}
              </div>
            )}

            {token && tokenHash && (
              <div
                style={{
                  marginTop: '10px',
                  fontWeight: 700,
                  fontSize: 40,
                }}
              >
                {truncateString(tokenHash)}
              </div>
            )}

            {nft && nftHash && (
              <div
                style={{
                  marginTop: '10px',
                  fontWeight: 900,
                  fontSize: 40,
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
      width: 720,
      height: 405,
    },
  );
}
