interface Props {
  accountId: string;
  blockHeight: any;
  content: string;
  highlight: any;
  raw: any;
  groupId: any;
  permissions: any;
  ownerId: string;
}
export default function (props: Props) {
  const accountId = props.accountId;
  const { timeAgo } = VM.require(`${props.ownerId}/widget/includes.Utils.libs`);
  const blockHeight: any =
    props.blockHeight === 'now' ? 'now' : parseInt(props.blockHeight);
  const data: any = Social.get(`${accountId}/post/comment`, blockHeight);
  const content: { type: string; text?: string; image?: string } | any =
    props.content ?? JSON.parse(data ?? 'null');
  console.log('content in feed comment', content);
  const profile: { name: string } | any = Social.getr(`${accountId}/profile`);
  const name = profile.name || 'No-name profile';
  const title = `@${accountId}`;
  const [time, setTime] = useState('');
  const [imageUrl, setImageUrl] = useState<string | any>('');
  const [fallbackUrl, _setFallbackUrl] = useState(
    'https://ipfs.near.social/ipfs/bafkreibmiy4ozblcgv3fm3gc6q62s55em33vconbavfd2ekkuliznaq3zm',
  );

  useEffect(() => {
    async function fetchTime() {
      setTime('Loading');
      try {
        asyncFetch(
          `https://api.near.social/time?blockHeight=${blockHeight}`,
        ).then((res: any) => {
          if (!res) {
            return 'Loading';
          }

          if (!res.ok || res.body === 'null') {
            return 'unknown';
          }
          const timeMs = parseFloat(res.body);
          const timeInSeconds = Math.floor(timeMs / 1000);
          return setTime(timeAgo(timeInSeconds));
        });
      } catch (error) {
        console.error('Error fetching time:', error);
        setTime('Loading');
      }
    }
    fetchTime();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockHeight]);

  useEffect(() => {
    if (JSON.stringify(content.image) !== JSON.stringify(imageUrl)) {
      setImageUrl(content.image);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.image, imageUrl]);

  function toUrl(image: { ipfs_cid?: string; url?: string }) {
    return (
      (image.ipfs_cid
        ? `https://ipfs.near.social/ipfs/${image.ipfs_cid}`
        : image.url) || fallbackUrl
    );
  }

  const [onHashtag] = useState(() => (hashtag: any) => (
    <span
      key={hashtag}
      className="d-inline-flex"
      style={{ color: 'var(--bs-link-color)' }}
    >
      <a href={`/?hashtag=${hashtag}`}>#{hashtag}</a>
    </span>
  ));

  const [onImage] = useState(() => (props: any) => props.src && <div></div>);

  const onLink = useCallback((props: any) => {
    if (props.children[0] === 'EMBED') {
      const href = props.href;

      const parsed = useMemo(() => {
        const parseUrl = (url: any) => {
          if (typeof url !== 'string') {
            return null;
          }
          if (url.startsWith('/')) {
            url = `https://near.social${url}`;
          }
          try {
            return new URL(url);
          } catch {
            return null;
          }
        };

        const url = parseUrl(href);
        if (!url) {
          return null;
        }
        return {
          widgetSrc: url.pathname.substring(1),
          props: Object.fromEntries([...url.searchParams.entries()]),
        };
      }, [href]);

      if (!parsed || !parsed.widgetSrc) {
        return <a href={href}>{props.children}</a>;
      }

      const widgetSrc = parsed.widgetSrc;

      const Wrapper = styled.div`
        border-radius: 0.5em;
        width: 100%;
        overflow: hidden;
        border: 1px solid #eee;
        white-space: normal;
        margin-top: 12px;
      `;

      return (
        <Wrapper>
          <Widget loading="" src={widgetSrc} props={parsed.props} />
        </Wrapper>
      );
    } else {
      return <a {...props} />;
    }
  }, []);

  return (
    <>
      <div className="flex py-4 border-b dark:border-black-200 px-4">
        <div className="w-max pr-2">
          <img
            className="rounded-full w-10 h-10"
            src={`https://i.near.social/magic/${'large'}/https://near.social/magic/img/account/${accountId}`}
            alt=""
          />
        </div>
        <div className="max-sm:!w-min w-fit">
          <div className="flex max-sm:!flex-col justify-start text-center">
            <div className="flex relative">
              <div className="flex justify-start ml-2">
                <p className="font-semibold dark:text-neargray-10 mr-1">
                  {name}
                </p>
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <span className="inline-block truncate max-w-[150px] text-gray-600 dark:text-neargray-10 font-thin">
                        {title}
                      </span>
                    </Tooltip.Trigger>
                    {!context.accountId && (
                      <Tooltip.Content
                        className="h-auto absolute max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                        align="start"
                        side="bottom"
                      >
                        {title}
                      </Tooltip.Content>
                    )}
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>
            </div>
            <p className="text-gray-600 dark:text-neargray-10 flex align-middle">
              {blockHeight === 'now' ? (
                'now'
              ) : (
                <span className="text-muted ml-2">{time}</span>
              )}
            </p>
          </div>

          <div className="container">
            <div className="top-0 ml-2 dark:text-neargray-10">
              <Markdown
                text={content.text}
                onHashtag={onHashtag}
                onImage={onImage}
                onLink={onLink}
              />
            </div>
            {content.image && (
              <div className="w-full flex justify-center text-center">
                <img
                  className="rounded-lg md:max-w-lg"
                  src={toUrl(imageUrl)}
                  loading="lazy"
                  alt="attached image"
                  onError={() => {
                    if (imageUrl !== fallbackUrl) {
                      State.update({
                        imageUrl: fallbackUrl,
                      });
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
