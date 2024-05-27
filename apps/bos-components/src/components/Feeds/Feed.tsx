interface Props {
  indexKey: string;
  accounts: string;
  permissions: boolean;
  groupId: string;
  isPremiumFeed: boolean;
  commentAccounts: string;
  filter: string;
  ownerId: string;
}
export default function (props: Props) {
  const indexKey = props.indexKey ?? 'main';
  const groupId = props.groupId;
  const permissions = props.permissions;

  const index = [
    {
      action: 'post',
      key: indexKey,
      options: {
        limit: 10,
        order: 'desc',
        accountId: props.accounts,
      },
      cacheOptions: {
        ignoreCache: true,
      },
    },
    {
      action: 'repost',
      key: indexKey,
      options: {
        limit: 10,
        order: 'desc',
        accountId: props.accounts,
      },
      cacheOptions: {
        ignoreCache: true,
      },
    },
  ];

  const isPremiumFeed = props.isPremiumFeed;
  const commentAccounts = props.commentAccounts;
  const renderedPosts: any = {};

  const makePostItem = (a: any) => ({
    type: 'social',
    path: `${a.accountId}/post/main`,
    blockHeight: a.blockHeight,
  });

  const renderPost = (a: any) => {
    if (a.value.type !== 'md') {
      return false;
    }
    const item = JSON.stringify(makePostItem(a));
    if (item in renderedPosts) {
      return false;
    }
    renderedPosts[item] = true;

    return (
      <div key={JSON.stringify(a)}>
        <Widget
          loading={<div className="w-100" style={{ height: '200px' }} />}
          src={`${props.ownerId}/widget/bos-components.components.Feeds.Post`}
          props={{
            accountId: a.accountId,
            blockHeight: a.blockHeight,
            isPremiumFeed,
            commentAccounts,
            indexKey,
            groupId,
            permissions,
            ownerId: props.ownerId,
          }}
        />
      </div>
    );
  };

  const repostSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 2 24 24"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path
        fill-rule="evenodd"
        d="M4.854 1.146a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L4 2.707V12.5A2.5 2.5 0 0 0 6.5 15h8a.5.5 0 0 0 0-1h-8A1.5 1.5 0 0 1 5 12.5V2.707l3.146 3.147a.5.5 0 1 0 .708-.708l-4-4z"
        transform="rotate(180, 12, 12), translate(0, 4)"
      />
      <path
        fill-rule="evenodd"
        d="M4.854 1.146a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L4 2.707V12.5A2.5 2.5 0 0 0 6.5 15h8a.5.5 0 0 0 0-1h-8A1.5 1.5 0 0 1 5 12.5V2.707l3.146 3.147a.5.5 0 1 0 .708-.708l-4-4z"
        transform="translate(0, 4)"
      />
    </svg>
  );

  const extractParentPost = (item: any) => {
    if (!item || item.type !== 'social' || !item.path || !item.blockHeight) {
      return undefined;
    }
    const accountId = item.path.split('/')[0];
    return `${accountId}/post/main` === item.path
      ? { accountId, blockHeight: item.blockHeight }
      : undefined;
  };

  const renderRepost = (a: any) => {
    if (a.value.type !== 'repost') {
      return false;
    }
    const post = extractParentPost(a.value.item);
    if (!post) {
      return false;
    }
    const item = JSON.stringify(makePostItem(post));
    if (item in renderedPosts) {
      return false;
    }

    renderedPosts[item] = true;

    return (
      <div key={JSON.stringify(a)}>
        <div
          className="text-muted"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            marginLeft: '24px',
            marginBottom: '-24px',
            paddingTop: '4px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {repostSvg} <span style={{ marginLeft: '8px' }}>Reposted by </span>
        </div>
        <Widget
          loading={<div className="w-100" style={{ height: '200px' }} />}
          src={`${props.ownerId}/widget/bos-components.components.Feeds.Post`}
          props={{
            accountId: post.accountId,
            blockHeight: post.blockHeight,
            reposted: true,
            isPremiumFeed,
            commentAccounts,
            indexKey,
            groupId,
            permissions,
            ownerId: props.ownerId,
          }}
        />
      </div>
    );
  };

  const renderItem = (item: any) =>
    item.action === 'post' ? renderPost(item) : renderRepost(item);

  return (
    <Widget
      src={`${props.ownerId}/widget/bos-components.components.Feeds.MergedIndexFeed`}
      props={{
        index,
        renderItem,
        filter: props.filter,
        threshold: 800,
        ownerId: props.ownerId,
      }}
    />
  );
}
