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
 */

import { timeAgo } from '@/includes/libs';
interface Props {
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
export default function ({ accountId, blockHeight, post }: Props) {
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
          return setTime(timeAgo(timeMs / 1000));
        });
      } catch (error) {
        console.error('Error fetching time:', error);
        setTime('Loading');
      }
    }
    fetchTime();
  }, [BlockHeight]);
  useEffect(() => {
    if (JSON.stringify(post.image) !== JSON.stringify(imageUrl)) {
      setImageUrl(post.image);
    }
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
    <>
      <div className="py-4 border-b px-8">
        <div className="flex justify-start text-center">
          <img
            className="rounded-full w-12 h-12"
            src={`https://i.near.social/magic/${'large'}/https://near.social/magic/img/account/${accountId}`}
            alt=""
          />
          <div className="flex justify-start ml-2 bottom-0 top-0">
            <p className="font-semibold">{name} </p>
            <p className="text-gray-600 font-thin ml-0.5"> {title}</p>
          </div>
          <p className="text-gray-600 flex align-middle">
            {blockHeight === 'now' ? (
              'now'
            ) : (
              <p className="text-muted">. {time}</p>
            )}
          </p>
        </div>
        <div className="mb-2">
          <div className="container">
            <div className="ml-12 top-0">
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
    </>
  );
}
