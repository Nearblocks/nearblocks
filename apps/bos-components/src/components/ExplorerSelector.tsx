/**
 * Component : ExplorerSelector
 * License : Business Source License 1.1
 * Description: Explorer Selector allows users to select which explorer they would like to be redirected to
 * @interface Props
 * @param {string} [path] -  Represents the URL path within the explorer selector, facilitating navigation to the chosen page based on the selection.
 * @param {string} [network] - Identifies the network within the explorer selector by specifying its identifier (e.g., 'testnet').
 */

interface Props {
  path?: string;
  network?: string;
}

const Container = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Lato:wght@400;700&display=swap');

  @media (min-width: 640px) {
    padding: 72px;
  }
`;
const InnerContainer = styled.div`
  max-width: 1224px;
  background-color: rgb(255, 255, 255);
  min-height: 260px;

  @media (min-width: 640px) {
    margin: 72px auto;
    padding: 24px;
  }

  @media (max-width: 640px) {
    margin-top: 90px;
    margin-bottom: 10rem;
  }
`;

const LinkContainer = styled.div<{
  isAvailable?: boolean;
}>`
  display: grid;
  ${(props: any) =>
    props.isAvailable
      ? 'grid-template-columns: repeat(3, 1fr)'
      : 'grid-template-columns: repeat(2, 1fr)'};
  grid-auto-rows: minmax(100px, auto);
  gap: 24px;
  min-width: 300px;
  margin-top: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    max-width: 300px;
  }
`;
const Background = styled.div`
  width: 100%;
  height: 84vh;
  display: flex;
  align-items: center;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGeSURBVHgB7doxTisxEAbgeY/mvQro6NiSDo6QkpJbcA2OwjWooKQMJ2DpKENJBV7FEYoBeQSIZr9PGk2cItWvsdfZnSBjKHVf6rnUbdD1N8g4K7VX6jhIEaycofaTIEWwcoam0yFYOYe179WiQ7Byhk8+8wnB6munlHNWgmD1tUGyFSYIVl8bJFcOCYLV106s/aBrJ2hNE+qo1GmpRanz2J5aB6X+x/oQv/l+FWz5E/O1iHU4pom0W/u0/uoZahnrgN2VGuv6Jpidl1+o2T5BznkrfKj9MdZT6l9836r+3k2pq1KXMVNz3gpbU7hOmj49AQ7x/lJ0WWsK5xhv2+AYkHQR29vbddDluqFvbNZPQZdg9S07az4gWH3tHZVgJQhW3xjb4XIZyo+Z3nffHN79CZ1gYuXc1b4KEytFsHLGptMhWDlj7Q9BimDlbJ4Ex4AftggHdwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIpXoUVLSWulnzoAAAAASUVORK5CYII=);
  background-size: 75px 75px;
  background-repeat: repeat;
  background-position: center top;
  padding: 1px;
  justify-content: center;
  flex-direction: column;
`;

const H1 = styled.h1`
  --text-hero: 500 72px/1 Inter, Lato, "Lucida Grande", Tahoma, sans-serif;
  font: var(--text-hero);
  text-align: center;
  font-feature-settings: normal;
  letter-spacing: -1.08px;
  line-height: 100%
  color: #000;
  margin: 0;
  font-stretch: 100%;
  overflow-wrap: break-word;
  box-sizing: border-box;
  @media (max-width: 768px) {
    font-size: 48px;
  };
`;
const H3 = styled.h3`
--text-l: 400 20px/1.3 Inter, Lato, "Lucida Grande", Tahoma, sans-serif;
  font: var(--text-l);
  color: #1b1b18;
  margin: 0px;
  overflow-wrap: break-word;
  text-align: center;
  justify-content: center;
  font-feature-settings normal;
  display: block;
  letter-spacing: 0.3px;
  font-stretch 100%;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  line-height: 130%;
  font-weight: 400 !important;

  @media (max-width: 768px) {
     font-size 16px !important;
     padding-top:1rem;
  }
`;

const H6 = styled.h6`
  text-align: center;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 32px;
  @media (max-width: 1024px) {
    font-size: 20px;
  }
  letter-spacing: 0.4px;
`;
const NearExplorerButton = styled.a<{
  isSelected?: string;
  isLinkActive?: boolean;
  isMobileFirst?: boolean;
}>`
  background-color: #ffffff;
  border: 1px solid rgb(27, 27, 24);
  position: relative;
  border-radius: 8px;
  padding: 32px;
  flex-direction: column;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  ${(props: any) =>
    props.isLinkActive
      ? 'pointer-events: none; background-color:rgb(227, 227, 224); opacity: 0.7; cursor: not-allowed;'
      : 'pointer-events: auto'};

  .logo {
    height: 45px;
    width: auto;
  }

  transition: all 0.4s ease 0s;
  cursor: pointer;
  outline: none;
  order: ${(props: any) => (props.isMobileFirst ? '0' : '1')};

  &:hover {
    background-color: rgb(227, 227, 224);
    text-decoration: none;
  }

  @media (min-width: 769px) {
    order: 0;
  }
`;

const ImageTab = styled.img<{ height: string; width: string }>`
  height: ${(props: any) => (props.height ? props.height : '')};
  width: ${(props: any) => (props.width ? props.width : '')};
`;

const Tag = styled.span`
  font-size: 10px;
  text-align: center;
  position: absolute;
  border-radius: 5px 5px 5px 5px;
  top: 0px;
  right: 0px;
  background-color: #00ec97;
  color: black;
  padding: 4px;
  font-weight: 600;
  margin-top: 5px;
  margin-right: 5px;
`;

const Badge = styled.span`
  font-size: 20px;
  text-align: center;
  border-radius: 5px;
  background-color: rgba(76, 189, 187, 0.1);
  padding-left: 6px;
  padding-right: 6px;
  color: #6b7280;
  margin-bottom: 18px;
`;

const ExplorerHead = styled.h3`
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: 130%;
  letter-spacing: 0.3px;
  padding: 26px 0px 16px;
  color: #000;
`;

const Footer = styled.div`
  padding: 1rem;
  margin-top: 2rem;
  text-align: center;
  width: 100%;
  @media (min-width: 640px) {
    max-width: 640px;
  }
  @media (min-width: 768px) {
    max-width: 768px;
  }
  @media (min-width: 1024px) {
    max-width: 1024px;
  }
  @media (min-width: 1280px) {
    max-width: 1024px;
  }
  @media (min-width: 1536px) {
    max-width: 1024px;
  }
  margin-left: auto;
  margin-right: auto;
`;

const FooterText = styled.div`
  font-size: 0.875rem;
  display: flex;
  justify-content: flex-end;
`;

const InnerSection = styled.div`
  padding: 1rem;
  margin: 0px auto;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  @media (max-width: 640px) {
    padding: 6px;
  }
`;

export default function (props: Props) {
  const [selected, setSelected] = useState<string>('nearblocks');

  const config = {
    nearblocks:
      props?.network === 'testnet'
        ? 'https://testnet.nearblocks.io'
        : 'https://nearblocks.io',
    nearblocksLite:
      props?.network === 'testnet'
        ? 'https://nearvalidate.org'
        : 'https://nearvalidate.org',
    pikespeakai: props?.network === 'testnet' ? null : 'https://pikespeak.ai',
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
      switch (getFirstPathSegment(link)) {
        case 'accounts':
          return (
            config.nearblocks + '/address/' + selectUrlAfterSecondSlash(link)
          );
        case 'transactions':
          return config.nearblocks + '/txns/' + selectUrlAfterSecondSlash(link);
        case 'receipts':
          return config.nearblocks + '/hash/' + selectUrlAfterSecondSlash(link);
        case 'stats':
          return config.nearblocks + '/charts';

        default:
          return config.nearblocks + link;
      }
    else {
      return config.nearblocks;
    }
  }
  function getPikespeakHref(link: string) {
    if (link)
      switch (getFirstPathSegment(link)) {
        case 'accounts':
          return (
            config.pikespeakai +
            '/wallet-explorer/' +
            selectUrlAfterSecondSlash(link)
          );
        case 'transactions':
          return (
            config.pikespeakai +
            '/transaction-viewer/' +
            selectUrlAfterSecondSlash(link)
          );
        case 'stats':
          return config.pikespeakai + '/near-world/overview';

        default:
          return config.pikespeakai;
      }
    else {
      return config.pikespeakai;
    }
  }
  function getNearblocksLiteHref(link: string) {
    if (link)
      switch (getFirstPathSegment(link)) {
        case 'accounts':
          return props?.network === 'testnet'
            ? config.nearblocksLite +
                '/address/' +
                selectUrlAfterSecondSlash(link) +
                `?network=testnet`
            : config.nearblocksLite +
                '/address/' +
                selectUrlAfterSecondSlash(link);
        case 'transactions':
          return props?.network === 'testnet'
            ? config.nearblocksLite +
                '/txns/' +
                selectUrlAfterSecondSlash(link) +
                `?network=testnet`
            : config.nearblocksLite +
                '/txns/' +
                selectUrlAfterSecondSlash(link);
        case 'receipts':
          return props?.network === 'testnet'
            ? config.nearblocksLite +
                '/hash/' +
                selectUrlAfterSecondSlash(link) +
                `?network=testnet`
            : config.nearblocksLite +
                '/hash/' +
                selectUrlAfterSecondSlash(link);
        case 'blocks':
          return props?.network === 'testnet'
            ? config.nearblocksLite +
                '/blocks/' +
                selectUrlAfterSecondSlash(link) +
                `?network=testnet`
            : config.nearblocksLite +
                '/blocks/' +
                selectUrlAfterSecondSlash(link);

        default:
          return config.nearblocksLite;
      }
    else {
      return config.nearblocksLite;
    }
  }
  function linkPikespeakai(link: string) {
    if (link)
      switch (getFirstPathSegment(link)) {
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
      switch (getFirstPathSegment(link)) {
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
      switch (getFirstPathSegment(link)) {
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

  function getFirstPathSegment(url: string) {
    const match = url.match(/\/([^/]+)/);

    if (match && match[1]) {
      return match[1];
    } else {
      return '';
    }
  }

  function selectUrlAfterSecondSlash(url: string) {
    const segments = url.split('/');

    if (segments.length >= 3) {
      const selectedUrl = segments.slice(2).join('/');
      return selectedUrl;
    } else {
      return '';
    }
  }

  function shortenHex(address: string) {
    return address?.length > 9
      ? `${address && address.substr(0, 6)}...${address.substr(-4)}`
      : address;
  }

  function isNumericId(id: string): boolean {
    return /^\d+$/.test(id);
  }

  const path = props?.path || '';
  const hasValidLink =
    linkNearblocks(path) || linkNearblocksLite(path) || linkPikespeakai(path);

  const isInvalidReceiptsPath =
    getFirstPathSegment(path) === 'receipts' &&
    isNumericId(selectUrlAfterSecondSlash(path));

  const href = getHref(path);
  const pikespeakHref = getPikespeakHref(path);
  const nearblocksLiteHref = getNearblocksLiteHref(path);
  const hasLinkNearblocks =
    !isInvalidReceiptsPath && props?.path ? !linkNearblocks(path) : false;
  const hasLinkNearblocksLite =
    !isInvalidReceiptsPath && props?.path ? !linkNearblocksLite(path) : false;
  const hasLinkPeakspeak =
    !isInvalidReceiptsPath && props?.path ? !linkPikespeakai(path) : false;

  function onSelect(value: string) {
    setSelected(value);
  }

  return (
    <>
      <Container>
        <Background>
          <InnerContainer>
            <>
              <InnerSection>
                <H1>NEAR Explorer Selector</H1>
                {getFirstPathSegment(path) &&
                  hasValidLink &&
                  !isInvalidReceiptsPath && (
                    <H6>
                      You are searching for{' '}
                      {selectUrlAfterSecondSlash(path)
                        ? removePlural(getFirstPathSegment(path))
                        : getFirstPathSegment(path)}
                      ...
                    </H6>
                  )}
                {selectUrlAfterSecondSlash(path) &&
                  !isInvalidReceiptsPath &&
                  hasValidLink && (
                    <Badge>{shortenHex(selectUrlAfterSecondSlash(path))}</Badge>
                  )}
                <H3>Choose from the available NEAR Explorers below</H3>
                <LinkContainer isAvailable={config.pikespeakai !== null}>
                  <NearExplorerButton
                    href={
                      !hasLinkNearblocksLite && !isInvalidReceiptsPath
                        ? (nearblocksLiteHref && nearblocksLiteHref) ||
                          (config.nearblocksLite ?? '') + path
                        : config.nearblocksLite ?? ''
                    }
                    isSelected={
                      selected === 'nearblockslite'
                        ? !linkNearblocksLite(path)
                          ? false
                          : true
                        : false
                    }
                    isLinkActive={
                      !linkNearblocksLite(path) ||
                      isInvalidReceiptsPath ||
                      config.nearblocksLite === null
                    }
                    onClick={() => {
                      onSelect('nearblockslite');
                    }}
                    isMobileFirst={false}
                  >
                    <ImageTab
                      height="45px"
                      width="auto"
                      src={'https://nearvalidate.org/images/near-validate.svg'}
                      alt="Nearblocks"
                    ></ImageTab>
                    <ExplorerHead>Near Validate</ExplorerHead>
                  </NearExplorerButton>
                  <NearExplorerButton
                    href={
                      !hasLinkNearblocks
                        ? href || config.nearblocks + path
                        : config.nearblocks
                    }
                    isSelected={
                      selected === 'nearblocks'
                        ? !linkNearblocks(path)
                          ? false
                          : true
                        : false
                    }
                    isLinkActive={
                      !linkNearblocks(path) || isInvalidReceiptsPath
                    }
                    onClick={() => {
                      onSelect('nearblocks');
                    }}
                    isMobileFirst={true}
                  >
                    <Tag>Recommended</Tag>
                    <ImageTab
                      height="45px"
                      width="auto"
                      src={'https://nearblocks.io/images/nearblocksblack.svg'}
                      alt="Nearblocks"
                    ></ImageTab>
                    <ExplorerHead>Nearblocks</ExplorerHead>
                  </NearExplorerButton>
                  {config.pikespeakai === null ? null : (
                    <NearExplorerButton
                      href={
                        !hasLinkPeakspeak
                          ? (pikespeakHref && pikespeakHref) ||
                            (config.pikespeakai ?? '') + path
                          : config.pikespeakai ?? ''
                      }
                      isSelected={
                        selected === 'pikespeakai'
                          ? !linkPikespeakai(path)
                            ? false
                            : true
                          : false
                      }
                      onClick={() => {
                        onSelect('pikespeakai');
                      }}
                      isLinkActive={
                        !linkPikespeakai(path) || config.pikespeakai === null
                      }
                      isMobileFirst={false}
                    >
                      <ImageTab
                        width="auto"
                        height="45px"
                        src={
                          'https://explorer.near.org/images/pikespeak_logo.png'
                        }
                        alt="Pikespeak"
                      ></ImageTab>
                      <ExplorerHead>Pikespeak</ExplorerHead>
                    </NearExplorerButton>
                  )}
                </LinkContainer>
              </InnerSection>
            </>
            <Footer>
              <FooterText>
                <a href="https://github.com/Nearblocks/nearblocks/blob/main/apps/bos-components/src/components/ExplorerSelector.tsx">
                  <ImageTab
                    height="2rem"
                    src={'https://nearblocks.io/images/github_icon.svg'}
                    alt="ExplorerSelector"
                  />
                </a>
              </FooterText>
            </Footer>
          </InnerContainer>
        </Background>
      </Container>
    </>
  );
}
