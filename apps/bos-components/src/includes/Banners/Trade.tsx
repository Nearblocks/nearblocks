/**
 * @interface Props
 * @param {string} [appUrl] - The URL of the application.
 */

interface Props {
  appUrl?: string;
}

const sponsoredTrade = [
  {
    title: 'Ref Finance - #1 AMM on NEAR',
    description:
      'Ref Finance is a community-led, multi-purpose DeFi platform built on the NEAR Protocol.',
    url: 'https://ref.finance',
  },
];

const Trade = (props: Props) => {
  return (
    <div>
      {sponsoredTrade.map((sponsore, i) => (
        <div
          key={i}
          className={`py-3 ${
            sponsoredTrade.length > 1 &&
            sponsoredTrade.length - 1 !== i &&
            'border-b'
          }`}
        >
          <a
            href={sponsore.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <span className="flex items-center text-green-500 dark:text-green-250 text-sm mb-2">
              <img
                src={`${props.appUrl}sponsored/ref-finance-icon.svg`}
                alt="1inch - #1 DeFi aggregator"
                width={20}
                height={20}
                className="w-5 h-5 mr-3"
              />
              <h3 className="ml-2"> {sponsore.title}</h3>
            </span>
          </a>
          <p className="text-xs text-gray-500 dark:text-neargray-10">
            {sponsore.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Trade;
