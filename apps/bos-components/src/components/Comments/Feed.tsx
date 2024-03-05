/**
 * Component: CommentsFeed
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: The component enables users to view and interact with comments.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {string} [path] - The path identifier passed as a string.
 * @param {number} [limit] - The maximum number of comments to display.
 */

interface Props {
  network: string;
  path: string;
  limit: number;
}

import { getConfig } from '@/includes/libs';

export default function (props: Props) {
  const [content, setContent] = useState('');
  const config = getConfig(props.network);
  const path = props.path;
  const index = {
    action: 'post',
    key: path,
    options: {
      limit: props.limit ?? 3,
      order: 'desc',
      subscribe: true,
      accountId: context.accountId,
    },
  };
  const composeData = () => {
    const data = {
      index: {
        post: JSON.stringify({
          key: path,
          value: {
            type: 'md',
            post: content,
          },
        }),
      },
    };

    return data;
  };
  const onChange = (newContent: {
    content: { type: string; text?: string; image?: string } | any;
  }) => {
    setContent(newContent.content);
  };

  const renderItem = (item: {
    accountId: string;
    blockHeight: number;
    value: { type: string; post: {} };
  }) =>
    item.value.type === 'md' && (
      <div key={JSON.stringify(item)} className="">
        <Widget
          src={`${config.ownerId}/widget/bos-components.components.Comments.Comment`}
          props={{
            accountId: item.accountId,
            blockHeight: item.blockHeight,
            ownerId: config.ownerId,
            post: item.value.post,
          }}
        />
      </div>
    );

  return (
    <>
      <div className="border-b">
        {
          <Widget
            src={`${config.ownerId}/widget/bos-components.components.Comments.InputField`}
            props={{
              onChange: onChange,
              composeButton: (onCompose: () => void) => (
                <CommitButton
                  disabled={!content}
                  force
                  className="btn-primary rounded-5"
                  data={composeData}
                  onCommit={() => {
                    onCompose();
                  }}
                >
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          type="submit"
                          disabled={!content}
                          className="inline-flex justify-center p-2 text-green-500  rounded-full cursor-pointer hover:bg-neargray-800"
                        >
                          <svg
                            className="w-5 h-5 rotate-90 rtl:-rotate-90"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 18 20"
                          >
                            <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                          </svg>
                        </button>
                      </Tooltip.Trigger>
                      {!context.accountId && (
                        <Tooltip.Content
                          className=" h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 "
                          align="start"
                          side="bottom"
                        >
                          {'Please LogIn'}
                        </Tooltip.Content>
                      )}
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </CommitButton>
              ),
            }}
          />
        }
      </div>
      <ScrollArea.Root className="w-full rounded overflow-hidden bg-white">
        <ScrollArea.Viewport className="w-full max-h-screen rounded">
          <div className="px-3 pb-2">
            {
              <Widget
                src={`${config.ownerId}/widget/bos-components.components.Comments.List`}
                props={{
                  index,
                  renderItem,
                  nextLimit: 10,
                  loadMoreText: 'Show earlier comments...',
                }}
              />
            }
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex select-none touch-none p-0.5 bg-neargray-25 transition-colors duration-[160ms] ease-out hover:bg-neargray-25 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="flex-1 bg-neargray-50 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar
          className="flex select-none touch-none p-0.5 bg-neargray-25 transition-colors duration-[160ms] ease-out hover:bg-neargray-25 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
          orientation="horizontal"
        >
          <ScrollArea.Thumb className="flex-1 bg-neargray-50 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner className="bg-neargray-50" />
      </ScrollArea.Root>
    </>
  );
}
