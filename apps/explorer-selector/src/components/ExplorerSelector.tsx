import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/ExplorerSelector.module.css';
import type { NetworkProps } from '@/utils/config';
import Image from 'next/image';

const imageStyle = {
  height: '45px',
  width: 'auto',
};

const footerImageStyle = {
  height: '2rem',
  width: 'auto',
};

export default function ExplorerSelector({ network }: NetworkProps) {
  const router = useRouter();
  const slug = router.query.slug;
  const path = slug ? slug[0] : '';
  const value = slug ? slug[1] : '';

  const config = {
    nearblocks:
      network === 'testnet'
        ? 'https://testnet.nearblocks.io'
        : 'https://nearblocks.io',
    nearrocks:
      network === 'testnet'
        ? 'https://testnet.near.rocks'
        : 'https://near.rocks',
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

  function getNearRocksHref(link: string) {
    if (link)
      switch (path) {
        case 'accounts':
          return config.nearrocks + '/account/' + value;
        case 'transactions':
          return config.nearrocks + '/tx/' + value;
        case 'blocks':
          return config.nearrocks + '/block/' + value;
        // WIP: receipts and stats are not yet available on Near Rocks
        case 'receipts':
        case 'stats':
          return null;
        default:
          return config.nearrocks;
      }
    else {
      return config.nearrocks;
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
        case 'nodes':
          return true;
        default:
          return false;
      }
    return false;
  }

  function linkNearRocks(link: string) {
    if (link)
      switch (path) {
        case '':
          return true;
        case 'accounts':
          return true;
        case 'transactions':
          return true;
        case 'blocks':
          return true;
        // WIP: receipts and stats are not yet available on Near Rocks
        case 'receipts':
        case 'stats':
          return false;
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
    linkNearRocks(path) ||
    linkNearblocks(path) ||
    linkPikespeakai(path);

  const isInvalidReceiptsPath = path === 'receipts' && isNumericId(value);

  const nearRocksHref = getNearRocksHref(path);
  const href = getHref(path);
  const pikespeakHref = getPikespeakHref(path);

  const isNearRocksInactive =
    (path && !linkNearRocks(path)) ||
    isInvalidReceiptsPath ||
    (path && value === '');

  const isNearblocksInactive =
    (path && !linkNearblocks(path)) ||
    isInvalidReceiptsPath ||
    (path && value === '');

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
          content="Choose from available NEAR blockchain explorers"
          name="description"
        />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
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
                  className={`${styles.nearExplorerButton} ${
                    isNearRocksInactive ? styles.inactive : ''
                  }`}
                  href={
                    !isNearRocksInactive
                      ? nearRocksHref || config.nearrocks
                      : config.nearrocks
                  }
                >
                  <Image
                    alt="Near Rocks"
                    height={45}
                    src="/images/nearrocks.svg"
                    style={imageStyle}
                    width={45}
                  />
                  <h3 className={styles.explorerHead}>Near Rocks</h3>
                </a>

                <a
                  className={`${styles.nearExplorerButton} ${
                    styles.mobileFirst
                  } ${isNearblocksInactive ? styles.inactive : ''}`}
                  href={
                    !isNearblocksInactive
                      ? href || config.nearblocks
                      : config.nearblocks
                  }
                >
                  <span className={styles.tag}>Recommended</span>

                  <Image
                    alt="Nearblocks"
                    height={45}
                    src="/images/nearblocksblack.svg"
                    style={imageStyle}
                    width={216}
                  />
                  <h3 className={styles.explorerHead}>Nearblocks</h3>
                </a>

                {config.pikespeakai && (
                  <a
                    className={`${styles.nearExplorerButton} ${
                      isPikespeakInactive ? styles.inactive : ''
                    }`}
                    href={
                      !isPikespeakInactive
                        ? (pikespeakHref && pikespeakHref) ||
                          (config.pikespeakai ?? '') + path
                        : config.pikespeakai ?? ''
                    }
                  >
                    <Image
                      alt="Pikespeak"
                      height={45}
                      src="/images/pikespeak_logo.png"
                      style={imageStyle}
                      width={51}
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
                    alt="ExplorerSelector"
                    height={45}
                    src="/images/github_icon.svg"
                    style={footerImageStyle}
                    width={51}
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
