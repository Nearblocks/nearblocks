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

interface LogoProps {
  className: string;
}
const Container = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Lato:wght@400;700&display=swap');
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

const LinkContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  min-height: 100vh;
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
  font-size: 12px;
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

const LogoContainer = styled.div`
  height: 45px;
  width: auto;
  display: flex;
  align-items: center;
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

  const Logo = (props: LogoProps) => (
    <svg
      fill="currentColor"
      viewBox="0 0 549 125"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill=" #FFFFFF"
        d="M84.142 2.303A57.6 57.6 0 0057.517 8.84c-8.248 4.296-15.387 10.529-20.833 18.188A60.868 60.868 0 0026.176 52.91a61.454 61.454 0 002.102 27.947 9.81 9.81 0 00-.893.694L5.892 100.312a10.54 10.54 0 00-2.488 3.237 10.79 10.79 0 00-.612 8.056 10.634 10.634 0 001.97 3.592 10.353 10.353 0 003.162 2.547 10.125 10.125 0 003.873 1.114c1.35.108 2.708-.058 3.996-.488a10.227 10.227 0 003.508-2.016L38.24 99.826c6.189 7.951 14.248 14.164 23.422 18.058a57.443 57.443 0 0029.031 4.205c9.869-1.135 19.296-4.815 27.397-10.696 8.1-5.881 14.611-13.77 18.922-22.929a61.303 61.303 0 005.726-29.438c-.555-10.15-3.617-19.99-8.9-28.6-5.282-8.609-12.613-15.705-21.304-20.623a57.625 57.625 0 00-28.391-7.5z"
      />
      <path
        fill="#033F40"
        d="M84.142 124.792a59.461 59.461 0 01-25.411-5.652c-7.972-3.742-15.056-9.21-20.763-16.027L20.737 118.16a12.502 12.502 0 01-4.286 2.449 12.295 12.295 0 01-4.875.584 12.356 12.356 0 01-4.722-1.37 12.626 12.626 0 01-3.85-3.116A12.961 12.961 0 01.61 112.32a13.166 13.166 0 01.768-9.825 12.832 12.832 0 013.043-3.942l21.244-18.518a63.813 63.813 0 01.977-38.351c4.252-12.362 12.196-23.04 22.708-30.52C59.863 3.684 72.408-.219 85.208.01c12.8.229 25.205 4.576 35.456 12.426 10.251 7.85 17.828 18.805 21.656 31.31a63.82 63.82 0 01-.328 38.363c-4.041 12.435-11.804 23.252-22.188 30.918-10.383 7.665-22.86 11.79-35.662 11.789v-.023zM38.556 96.516l1.458 1.852c8.774 11.247 21.34 18.729 35.227 20.974 13.888 2.246 28.095-.907 39.828-8.839 11.732-7.932 20.143-20.069 23.579-34.026 3.436-13.957 1.649-28.725-5.011-41.401-6.659-12.677-17.709-22.346-30.978-27.106a55.116 55.116 0 00-40.73 1.378c-12.933 5.647-23.335 16.042-29.162 29.14-5.827 13.1-6.658 27.957-2.33 41.65l.52 1.644-1.401.973c-.238.173-.475.347-.701.544L7.362 102.083a8.191 8.191 0 00-2.179 2.507 8.428 8.428 0 00-.717 6.53 8.309 8.309 0 001.58 2.94 8.094 8.094 0 002.595 2.051 7.886 7.886 0 006.413.279 8.03 8.03 0 002.755-1.818l20.747-18.056z"
      />
      <path
        fill="#033F40"
        d="M87.07 82.57a4.328 4.328 0 01-1.945-1.017 4.474 4.474 0 01-1.22-1.854l-8.458-24.641-30.526 31.25c5.938 10.18 15.432 17.67 26.56 20.956 11.13 3.285 23.062 2.12 33.383-3.26 10.321-5.38 18.26-14.573 22.211-25.719a47.788 47.788 0 00-.931-34.315L91.095 81.262a4.34 4.34 0 01-1.847 1.187 4.256 4.256 0 01-2.178.12z"
      />
      <path
        fill="#033F40"
        d="M78.217 42.616a4.274 4.274 0 011.923 1.015 4.42 4.42 0 011.198 1.843l8.366 24.503 32.065-34.109c-6.267-9.341-15.635-16.035-26.36-18.836-10.727-2.802-22.082-1.52-31.954 3.606-9.873 5.126-17.59 13.748-21.72 24.262a47.795 47.795 0 00-.726 32.9l33.183-33.992a4.298 4.298 0 011.862-1.13 4.222 4.222 0 012.163-.062z"
      />
      <path
        fill="#2A323A"
        d="M232.749 40.208h-22.363v3.831h22.363v-3.83zM210.386 55.903V76.33h22.363v-3.866h-18.304V60h17.083v-4.097h-21.142zM239.748 76.331h4.33l11.555-31.076h2.001l11.555 31.076h4.138l-13.624-36.123h-6.331l-13.624 36.123zM282.587 38.46v3.936h15.308c7.7 0 7.847 7.222 7.847 8.229 0 1.007-.079 7.176-7.394 7.176h-15.761v18.356h4.341V61.331h4.331a5.99 5.99 0 013.301.81c.426.273.807.613 1.131 1.007 1.074 1.377 8.592 11.493 8.592 11.493a6.127 6.127 0 004.037 1.574 11.94 11.94 0 012.182 0l-10.877-14.884s10.436-.88 10.425-10.532c-.012-9.653-6.502-12.176-12.256-12.246-5.755-.07-15.207-.092-15.207-.092zM169.774 76.377V40.764h6.513l22.001 32.21v-32.21h3.901v35.613h-6.128l-22.386-32.314v32.314h-3.901zM321.469 39.34h22.329a7.054 7.054 0 013.335.834 9.51 9.51 0 012.77 2.314 10.966 10.966 0 011.889 3.392c.482 1.353.723 2.784.712 4.224a8.156 8.156 0 01-.317 2.315 10.078 10.078 0 01-.814 2.049 11.07 11.07 0 01-1.13 1.736c-.419.52-.814.983-1.131 1.365.377.425.754.888 1.131 1.39.422.525.8 1.087 1.13 1.678.344.626.628 1.285.848 1.967.228.71.343 1.452.339 2.2a12.29 12.29 0 01-.712 4.224 10.763 10.763 0 01-1.888 3.38 9.137 9.137 0 01-2.849 2.198 6.938 6.938 0 01-3.336.845h-22.306v-36.11zm23.629 16.204a9.06 9.06 0 002.262-2.581c.591-.899.924-1.95.961-3.032a8.39 8.39 0 00-.374-2.408 8.18 8.18 0 00-1.04-2.315 5.888 5.888 0 00-1.639-1.643 3.893 3.893 0 00-2.205-.637h-17.637v28.82h17.75a3.89 3.89 0 002.262-.637 5.41 5.41 0 001.605-1.655c.454-.71.79-1.492.995-2.315a9.02 9.02 0 00.339-2.396 5.785 5.785 0 00-.961-3.067 9.61 9.61 0 00-2.318-2.604h-7.066v-3.53h7.066zM359.966 75.451v-36.11h3.957v32.465h22.895v3.645h-26.852zM391.001 50.3c1.806-4.376 5.216-7.853 9.497-9.687a17.734 17.734 0 017.01-1.446c2.408 0 4.791.491 7.01 1.446 4.276 1.843 7.682 5.318 9.497 9.688a18.454 18.454 0 011.414 7.089c0 2.436-.481 4.848-1.414 7.09-1.818 4.37-5.223 7.847-9.497 9.698a17.725 17.725 0 01-7.01 1.447c-2.407 0-4.79-.492-7.01-1.447-4.279-1.843-7.686-5.323-9.497-9.699a18.472 18.472 0 01-1.413-7.089c0-2.436.481-4.848 1.413-7.09zm3.505 12.617c1.49 3.431 4.18 6.168 7.541 7.673a13.456 13.456 0 005.456 1.158c1.876 0 3.733-.394 5.455-1.158a15.035 15.035 0 004.522-3.125 14.867 14.867 0 003.121-4.548 13.52 13.52 0 001.13-5.463 13.918 13.918 0 00-1.13-5.475 15.081 15.081 0 00-3.053-4.63 15.318 15.318 0 00-4.522-3.16 12.868 12.868 0 00-5.45-1.157 13.096 13.096 0 00-5.483 1.158 14.972 14.972 0 00-4.523 3.16 14.945 14.945 0 00-3.053 4.63 13.718 13.718 0 00-1.13 5.474 13.344 13.344 0 001.119 5.463zM433.286 50.301a18.79 18.79 0 013.81-5.787 18.083 18.083 0 015.653-3.9 17.275 17.275 0 018.589-1.406 17.378 17.378 0 018.201 2.968 19.316 19.316 0 013.754 3.414 18.93 18.93 0 012.747 4.283l-3.166 2.083a15.083 15.083 0 00-2.182-3.472 15.747 15.747 0 00-3.019-2.836 13.89 13.89 0 00-3.708-1.886 13.354 13.354 0 00-9.633.52 14.987 14.987 0 00-4.511 3.16 14.742 14.742 0 00-3.053 4.63 13.718 13.718 0 00-1.13 5.474 13.348 13.348 0 001.13 5.463 14.779 14.779 0 003.053 4.456 14.687 14.687 0 004.523 3.125 13.117 13.117 0 005.46 1.158 13.438 13.438 0 003.845-.556 14.005 14.005 0 003.47-1.528 14.847 14.847 0 002.94-2.314 13.27 13.27 0 002.261-3.033l2.714 2.836a18.368 18.368 0 01-6.309 6.157 17.018 17.018 0 01-8.898 2.315 17.22 17.22 0 01-7.01-1.447c-4.279-1.843-7.686-5.323-9.497-9.699a18.453 18.453 0 01-1.413-7.089c0-2.436.48-4.848 1.413-7.089h-.034zM473.536 75.451v-36.11h3.957v16.377h11.985v3.645h-11.985v16.088h-3.957zm34.201-36.11l-8.649 18.228 8.649 17.882h-4.296l-8.763-17.881 8.763-18.23h4.296zM527.398 43.044a5.633 5.633 0 00-2.455.385c-.781.31-1.486.791-2.067 1.409a6.806 6.806 0 00-1.527 4.63 7.207 7.207 0 001.074 4.05c.41.567.926 1.043 1.518 1.4.592.358 1.249.59 1.931.684v3.761a7.013 7.013 0 01-3.302-.81 9.566 9.566 0 01-2.747-2.141 9.985 9.985 0 01-1.865-3.125 10.65 10.65 0 01-.679-3.82c-.017-1.4.213-2.791.679-4.108a9.424 9.424 0 011.865-3.16 8.59 8.59 0 012.77-2.025 8.236 8.236 0 013.392-.718h21.764v3.588h-20.351zm10.684 28.82a5.634 5.634 0 002.455-.386 5.752 5.752 0 002.068-1.409 6.805 6.805 0 001.526-4.571 7.07 7.07 0 00-1.074-4.028 5.197 5.197 0 00-1.523-1.38 5.072 5.072 0 00-1.925-.669v-3.82a7.02 7.02 0 013.312.811 9.523 9.523 0 012.737 2.141 9.857 9.857 0 011.865 3.148 10.82 10.82 0 01.678 3.797 11.364 11.364 0 01-.701 4.108 9.809 9.809 0 01-1.899 3.149 8.31 8.31 0 01-2.77 2.025 7.838 7.838 0 01-3.392.73h-21.606v-3.647h20.249z"
      />
      <rect fill="#73B0F6" height={35} rx={17.5} width={80} x={151} y={87} />
      <path
        d="M169.194 114V93.168h3.864v17.444h10.136V114h-14zM185.728 96.612v-3.444h3.64v3.444h-3.64zm.056 17.388V99.048h3.556V114h-3.556zM191.669 101.484v-2.436h2.296v-4.76h3.5v4.76h2.996v2.436h-2.996v8.372c0 1.092.588 1.4 1.596 1.4.364 0 .868-.056 1.148-.112h.168v2.772c-.588.112-1.4.224-2.352.224-2.408 0-4.06-.868-4.06-3.5v-9.156h-2.296zM209.816 114.448c-4.76 0-7.616-3.472-7.616-7.896 0-4.452 2.996-7.896 7.42-7.896 2.184 0 3.892.756 5.152 2.1 1.456 1.54 2.156 3.892 2.128 6.664h-11.172c.252 2.576 1.624 4.312 4.116 4.312 1.708 0 2.828-.728 3.304-1.96h3.472c-.728 2.688-3.136 4.676-6.804 4.676zm-.196-13.216c-2.324 0-3.528 1.596-3.836 3.948h7.448c-.14-2.464-1.456-3.948-3.612-3.948z"
        fill="#000"
      />
    </svg>
  );

  const config = {
    nearblocks:
      props?.network === 'testnet'
        ? 'https://testnet.nearblocks.io'
        : 'https://nearblocks.io',
    nearblocksLite:
      props?.network === 'testnet' ? null : 'https://lite.nearblocks.io',
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
          return (
            config.nearblocksLite +
            '/address/' +
            selectUrlAfterSecondSlash(link)
          );
        case 'transactions':
          return (
            config.nearblocksLite + '/txns/' + selectUrlAfterSecondSlash(link)
          );
        case 'blocks':
          return (
            config.nearblocksLite + '/blocks/' + selectUrlAfterSecondSlash(link)
          );

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

  const path = props?.path || '';
  const href = getHref(path);
  const pikespeakHref = getPikespeakHref(path);
  const nearblocksLiteHref = getNearblocksLiteHref(path);
  const hasLinkNearblocks = props?.path ? !linkNearblocks(path) : false;
  const hasLinkNearblocksLite = props?.path ? !linkNearblocksLite(path) : false;
  const hasLinkPeakspeak = props?.path ? !linkPikespeakai(path) : false;

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
                  !hasLinkNearblocks &&
                  !hasLinkNearblocks && (
                    <H6>
                      You are searching for{' '}
                      {selectUrlAfterSecondSlash(path)
                        ? removePlural(getFirstPathSegment(path))
                        : getFirstPathSegment(path)}
                      ...
                    </H6>
                  )}
                {selectUrlAfterSecondSlash(path) && (
                  <Badge>{shortenHex(selectUrlAfterSecondSlash(path))}</Badge>
                )}
                <H3>Choose from the available NEAR Explorers below</H3>
                <LinkContainer>
                  <NearExplorerButton
                    href={
                      !hasLinkNearblocksLite
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
                      config.nearblocksLite === null
                    }
                    onClick={() => {
                      onSelect('nearblockslite');
                    }}
                    isMobileFirst={false}
                  >
                    <LogoContainer>
                      <Logo className="logo" />
                    </LogoContainer>
                    <ExplorerHead>Nearblocks Lite</ExplorerHead>
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
                    isLinkActive={!linkNearblocks(path)}
                    onClick={() => {
                      onSelect('nearblocks');
                    }}
                    isMobileFirst={true}
                  >
                    <Tag>Recommended</Tag>
                    <ImageTab
                      height="45px"
                      width="auto"
                      src={'https://nearblocks.io/images/nb-black-on-bos.svg'}
                      alt="Nearblocks"
                    ></ImageTab>
                    <ExplorerHead>Nearblocks</ExplorerHead>
                  </NearExplorerButton>
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
