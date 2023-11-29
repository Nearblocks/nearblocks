/**
 * @interface Props
 * @param {string} appUrl - The URL of the application.
 */

interface Props {
  appUrl?: string;
}

const sponsoredStore = [
  {
    title: '1inch Wallet  - Your self-custodial vault',
    description:
      'Audited by top security firms. Hardware wallet connection. MEV protected. Easy to use, secure and self-custodial. Try the 1inch Wallet now!',
    url: 'https://1inch.network/Nearblocks_StoreButton',
    image: '/sponsored/1inch.svg',
  },
];

const Store = (props: Props) => {
  return (
    <div>
      {sponsoredStore.map((sponsore, i) => (
        <div
          key={i}
          className={`py-3 ${
            sponsoredStore.length > 1 &&
            sponsoredStore.length - 1 !== i &&
            'border-b'
          }`}
        >
          <a
            href={sponsore.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <span className="flex items-center text-green-500 text-sm mb-2">
              <img
                alt="1inch - #1 DeFi aggregator"
                width={20}
                height={20}
                className="w-5 h-5 mr-3"
                src={`${props.appUrl}sponsored/1inch.svg`}
              />
              <h3 className="ml-2"> {sponsore.title}</h3>
            </span>
          </a>
          <p className="text-xs text-gray-500">{sponsore.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Store;
