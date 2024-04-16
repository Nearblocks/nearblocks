/**
 * Component: CommentsComment
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: The component displays a single post/comment.
 * @interface Props
 * @param {string} accountId - The identifier of the account associated with the post.
 * @param {string} blockHeight - The block height at which the post was made.
 * @param {Object} post - The content of the post including image and text.
 * @param {string} post.text - The text content of the post.
 * @param {Object} post.image - The image object associated with the post.
 * @param {string} post.image.ipfs_cid - The IPFS CID of the image.
 * @param {string} post.image.url - The URL of the image.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  ownerId: string;
  accountId: string;
  blockHeight: string;
  post: {
    text: string;
    image?: {
      ipfs_cid?: string;
      url?: string;
    };
  };
}
export default function ({ accountId, blockHeight, post, ownerId }: Props) {
  const { timeAgo } = VM.require(`${ownerId}/widget/includes.Utils.libs`);

  const BlockHeight = blockHeight === 'now' ? 'now' : parseInt(blockHeight);

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
          `https://api.near.social/time?blockHeight=${BlockHeight}`,
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
  }, [BlockHeight]);

  useEffect(() => {
    if (JSON.stringify(post.image) !== JSON.stringify(imageUrl)) {
      setImageUrl(post.image);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.image, imageUrl]);

  function toUrl(image: { ipfs_cid?: string; url?: string }) {
    return (
      (image.ipfs_cid
        ? `https://ipfs.near.social/ipfs/${image.ipfs_cid}`
        : image.url) || fallbackUrl
    );
  }

  const renderPath = (properties: any) => {
    return (
      <Widget
        key={properties}
        src={properties.path}
        props={properties.params}
      />
    );
  };
  return (
    <div className="flex py-4 border-b px-4">
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
              <p className="font-semibold mr-1">{name}</p>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <span className="inline-block truncate max-w-[150px] text-gray-600 font-thin">
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
          <p className="text-gray-600 flex align-middle">
            {blockHeight === 'now' ? (
              'now'
            ) : (
              <span className="text-muted ml-2">{time}</span>
            )}
          </p>
        </div>

        <div className="container">
          <div className="top-0 ml-2">
            <Markdown text={post.text} onPath={renderPath} />
          </div>
          {post.image && (
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
  );
}
