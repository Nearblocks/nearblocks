const Links = (props: any) => {
  const networkAccountId =
    context.networkId === 'mainnet' ? 'nearblocks.near' : 'nearblocks.testnet';

  const { urlHostName } = VM.require(
    `${networkAccountId}/widget/includes.Utils.libs`,
  );

  const { meta } = props;
  const twitter = urlHostName && urlHostName(meta?.twitter);
  const facebook = urlHostName && urlHostName(meta?.facebook);
  const telegram = urlHostName && urlHostName(meta?.telegram);

  return (
    <div className="flex space-x-4">
      {meta?.twitter && (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <a
                href={
                  !twitter
                    ? `https://twitter.com/${meta.twitter}`
                    : meta.twitter
                }
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex"
              >
                <img
                  width="16"
                  height="16"
                  className="w-4 h-4"
                  src="/images/twitter_icon.svg"
                  alt="Twitter"
                />
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content
              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
              sideOffset={8}
              place="bottom"
            >
              Twitter
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
      {meta?.facebook && (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <a
                href={
                  !facebook
                    ? `https://facebook.com/${meta.facebook}`
                    : meta.facebook
                }
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex"
              >
                <img
                  width="16"
                  height="16"
                  className="w-4 h-4"
                  src="/images/facebook_icon.svg"
                  alt="Facebook"
                />
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content
              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
              sideOffset={8}
              place="bottom"
            >
              Facebook
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
      {meta?.telegram && (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <a
                href={
                  !telegram ? `https://t.me/${meta.telegram}` : meta.telegram
                }
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex"
              >
                <img
                  width="16"
                  height="16"
                  className="w-4 h-4"
                  src="/images/telegram_icon.svg"
                  alt="Telegram"
                />
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content
              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
              sideOffset={8}
              place="bottom"
            >
              Telegram
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
      {meta?.coingecko_id && (
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <a
                href={`https://www.coingecko.com/en/coins/${meta.coingecko_id}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex"
              >
                <img
                  width="16"
                  height="16"
                  className="w-4 h-4"
                  src="/images/coingecko_icon.svg"
                  alt="coingecko"
                />
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content
              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
              sideOffset={8}
              place="bottom"
            >
              CoinGecko
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
    </div>
  );
};

export default Links;
