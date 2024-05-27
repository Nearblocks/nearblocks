interface Props {
  ownerId: string;
  item: string;
  limit: number;
  accounts: string;
  subscribe: string;
  groupId: string;
  permissions: string;
  raw: string;
  highlightComment: any;
}
export default function (props: Props) {
  const index = {
    action: 'comment',
    key: props.item,
    options: {
      limit: props.limit ?? 3,
      order: 'desc',
      accountId: props.accounts,
      subscribe: props.subscribe,
    },
  };

  const groupId = props.groupId;
  const permissions = props.permissions;
  const raw = !!props.raw;

  const renderItem = (a: any) =>
    a.value.type === 'md' && (
      <Widget
        key={JSON.stringify(a)}
        loading={<div className="w-100" style={{ minHeight: '200px' }} />}
        src={`${props.ownerId}/widget/bos-components.components.Feeds.FeedComment`}
        props={{
          accountId: a.accountId,
          blockHeight: a.blockHeight,
          highlight:
            a.accountId === props.highlightComment?.accountId &&
            a.blockHeight === props.highlightComment?.blockHeight,
          raw,
          groupId,
          permissions,
          ownerId: props.ownerId,
        }}
      />
    );

  return (
    <Widget
      loading={false}
      src={`${props.ownerId}/widget/bos-components.components.Feeds.FilteredIndexFeed`}
      props={{
        ownerId: props.ownerId,
        loading: false,
        index,
        reverse: true,
        manual: true,
        renderItem,
        nextLimit: 10,
        loadMoreText: (
          <div className="py-1 pl-16 leading-6 relative hover:bg-black/3 text-green-500 before:custom-before font-semibold text-sm">
            Show earlier comments...
          </div>
        ),
      }}
    />
  );
}
