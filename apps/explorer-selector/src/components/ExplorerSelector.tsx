import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/ExplorerSelector.module.css';
import { getNetworkId } from '@/utils/config';
import Image from 'next/image';

const imageStyle = {
  width: 'auto',
  height: '45px',
};

const footerImageStyle = {
  height: '2rem',
  width: 'auto',
};

export default function ExplorerSelector() {
  const router = useRouter();
  const slug = router.query.slug;
  const path = slug ? slug[0] : '';
  const value = slug ? slug[1] : '';
  const network = getNetworkId();

  const config = {
    nearblocks:
      network === 'testnet'
        ? 'https://testnet.nearblocks.io'
        : 'https://nearblocks.io',
    nearblocksLite:
      network === 'testnet'
        ? 'https://nearvalidate.org'
        : 'https://nearvalidate.org',
    pikespeakai: network === 'testnet' ? null : 'https://pikespeak.ai',
  };

  function removePlural(word: string) {
    if (word.slice(-1) === 's') {
      return word.slice(0, -1);
    } else {
      return word;
    }
  }

  function getHref(link: string) {
    if (link)
      switch (path) {
        case 'accounts':
          return config.nearblocks + '/address/' + value;
        case 'transactions':
          return config.nearblocks + '/txns/' + value;
        case 'receipts':
          return config.nearblocks + '/hash/' + value;
        case 'stats':
          return config.nearblocks + '/charts';
        case 'blocks':
          return config.nearblocks + '/blocks/' + value;
        default:
          return config.nearblocks + link;
      }
    else {
      return config.nearblocks;
    }
  }

  function getPikespeakHref(link: string) {
    if (link)
      switch (path) {
        case 'accounts':
          return config.pikespeakai + '/wallet-explorer/' + value;
        case 'transactions':
          return config.pikespeakai + '/transaction-viewer/' + value;
        case 'stats':
          return config.pikespeakai + '/near-world/overview';
        case 'receipts':
          return null;
        default:
          return config.pikespeakai;
      }
    else {
      return config.pikespeakai;
    }
  }

  function getNearblocksLiteHref(link: string) {
    if (link)
      switch (path) {
        case 'accounts':
          return network === 'testnet'
            ? config.nearblocksLite + '/address/' + value + `?network=testnet`
            : config.nearblocksLite + '/address/' + value;
        case 'transactions':
          return network === 'testnet'
            ? config.nearblocksLite + '/txns/' + value + `?network=testnet`
            : config.nearblocksLite + '/txns/' + value;
        case 'receipts':
          return network === 'testnet'
            ? config.nearblocksLite + '/hash/' + value + `?network=testnet`
            : config.nearblocksLite + '/hash/' + value;
        case 'blocks':
          return network === 'testnet'
            ? config.nearblocksLite + '/blocks/' + value + `?network=testnet`
            : config.nearblocksLite + '/blocks/' + value;
        default:
          return config.nearblocksLite;
      }
    else {
      return config.nearblocksLite;
    }
  }

  function linkPikespeakai(link: string) {
    if (link)
      switch (path) {
        case '':
          return true;
        case 'accounts':
          return true;
        case 'transactions':
          return true;
        case 'receipts':
          return false;
        case 'blocks':
          return false;
        case 'stats':
          return true;
        default:
          return false;
      }
    return false;
  }

  function linkNearblocks(link: string) {
    if (link)
      switch (path) {
        case '':
          return true;
        case 'accounts':
          return true;
        case 'transactions':
          return true;
        case 'receipts':
          return true;
        case 'blocks':
          return true;
        case 'stats':
          return true;
        default:
          return false;
      }
    return false;
  }

  function linkNearblocksLite(link: string) {
    if (link)
      switch (path) {
        case '':
          return true;
        case 'accounts':
          return true;
        case 'transactions':
          return true;
        case 'receipts':
          return true;
        case 'blocks':
          return true;
        case 'stats':
          return true;
        case 'nodes':
          return true;
        default:
          return false;
      }
    return false;
  }

  function shortenHex(address: string) {
    return address?.length > 9
      ? `${address && address.substr(0, 6)}...${address.substr(-4)}`
      : address;
  }

  function isNumericId(id: string): boolean {
    return /^\d+$/.test(id);
  }

  const hasValidLink =
    linkNearblocks(path) || linkNearblocksLite(path) || linkPikespeakai(path);

  const isInvalidReceiptsPath = path === 'receipts' && isNumericId(value);

  const href = getHref(path);
  const pikespeakHref = getPikespeakHref(path);
  const nearblocksLiteHref = getNearblocksLiteHref(path);

  const isNearblocksInactive =
    (path && !linkNearblocks(path)) ||
    isInvalidReceiptsPath ||
    (path && value === '');

  const isNearblocksLiteInactive =
    (path && !linkNearblocksLite(path)) ||
    isInvalidReceiptsPath ||
    config.nearblocksLite === null ||
    (path && value === '') ||
    path === 'stats';

  const isPikespeakInactive =
    (path && !linkPikespeakai(path)) ||
    isInvalidReceiptsPath ||
    config.pikespeakai === null ||
    (path && value === '') ||
    path === 'stats';

  return (
    <>
      <Head>
        <title>NEAR Explorer Selector</title>
        <meta
          name="description"
          content="Choose from available NEAR blockchain explorers"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.container}>
        <div className={styles.background}>
          <div className={styles.innerContainer}>
            <div className={styles.innerSection}>
              <h1 className={styles.h1}>NEAR Explorer Selector</h1>

              {path &&
                hasValidLink &&
                !isInvalidReceiptsPath &&
                value !== '' && (
                  <h6 className={styles.h6}>
                    You are searching for {value ? removePlural(path) : path}
                    ...
                  </h6>
                )}

              {value && !isInvalidReceiptsPath && hasValidLink && (
                <span className={styles.badge}>{shortenHex(value)}</span>
              )}

              <h3 className={styles.h3}>
                Choose from the available NEAR Explorers below
              </h3>

              <div
                className={`${styles.linkContainer} ${
                  config.pikespeakai !== null
                    ? styles.threeColumns
                    : styles.twoColumns
                }`}
              >
                <a
                  href={
                    !isNearblocksLiteInactive
                      ? (nearblocksLiteHref && nearblocksLiteHref) ||
                        (config.nearblocksLite ?? '') + path
                      : config.nearblocksLite ?? ''
                  }
                  className={`${styles.nearExplorerButton} ${
                    isNearblocksLiteInactive ? styles.inactive : ''
                  }`}
                >
                  <Image
                    src="https://nearvalidate.org/images/near-validate.svg"
                    style={imageStyle}
                    width={216}
                    height={45}
                    alt="Near Validate"
                  />
                  <h3 className={styles.explorerHead}>Near Validate</h3>
                </a>

                <a
                  href={
                    !isNearblocksInactive
                      ? href || config.nearblocks
                      : config.nearblocks
                  }
                  className={`${styles.nearExplorerButton} ${
                    styles.mobileFirst
                  } ${isNearblocksInactive ? styles.inactive : ''}`}
                >
                  <span className={styles.tag}>Recommended</span>

                  <Image
                    src="/images/nearblocksblack.svg"
                    style={imageStyle}
                    width={216}
                    height={45}
                    alt="Nearblocks"
                  />
                  <h3 className={styles.explorerHead}>Nearblocks</h3>
                </a>

                {config.pikespeakai && (
                  <a
                    href={
                      !isPikespeakInactive
                        ? (pikespeakHref && pikespeakHref) ||
                          (config.pikespeakai ?? '') + path
                        : config.pikespeakai ?? ''
                    }
                    className={`${styles.nearExplorerButton} ${
                      isPikespeakInactive ? styles.inactive : ''
                    }`}
                  >
                    <Image
                      src="/images/pikespeak_logo.png"
                      style={imageStyle}
                      width={51}
                      height={45}
                      alt="Pikespeak"
                    />
                    <h3 className={styles.explorerHead}>Pikespeak</h3>
                  </a>
                )}
              </div>
            </div>

            <div className={styles.footer}>
              <div className={styles.footerText}>
                <a href="https://github.com/Nearblocks/nearblocks/blob/main/apps/explorer-selector/src/components/ExplorerSelector.tsx">
                  <Image
                    src="/images/github_icon.svg"
                    style={footerImageStyle}
                    width={51}
                    height={45}
                    alt="ExplorerSelector"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
