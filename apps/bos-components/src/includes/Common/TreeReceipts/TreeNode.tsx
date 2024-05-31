interface Props {
  className: string;
}

export default function ({
  node,
  path,
  ownerId,
}: {
  node: any;
  path: string;
  ownerId: string;
}) {
  const ArrowUp = (props: Props) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={24}
        height={24}
        {...props}
      >
        <path fill="none" d="M0 0h24v24H0z" />
        <path d="M12 10.828l-4.95 4.95-1.414-1.414L12 8l6.364 6.364-1.414 1.414z" />
      </svg>
    );
  };
  const ArrowDown = (props: Props) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={24}
        height={24}
        {...props}
      >
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z"
        />
      </svg>
    );
  };
  const [expandedPaths, setExpandedPaths] = useState<{
    [key: string]: boolean;
  }>({});

  const handleClick = (key: string) => {
    setExpandedPaths((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const renderNode = (node: any, currentPath: string, level: number) => {
    if (typeof node === 'object' && node !== null) {
      return Object.entries(node).map(([key, value], index) => {
        const newPath = `${currentPath}.${key}`;
        const isExpanded = expandedPaths[newPath] || false;
        level++;
        return (
          <div key={index} className="w-full pl-2">
            <div className="flex items-center">
              <span
                className="flex items-center cursor-pointer"
                onClick={() => handleClick(newPath)}
              >
                <span className="text-green-500 dark:text-green-250">
                  {isExpanded ? (
                    <ArrowDown className="fill-current" />
                  ) : (
                    <ArrowUp className="fill-current rotate-90" />
                  )}
                </span>
                <span className="ml-1 text-green-500 dark:text-green-250">
                  {`"${key}": `}
                  <span className="text-green-500 dark:text-green-250 font-semibold">{` { `}</span>
                </span>
              </span>
              {isExpanded ? (
                <></>
              ) : (
                <span className="mx-0.5 font-semibold">
                  {` . . . `}
                  <span className="text-green-500 dark:text-green-250">{` }`}</span>
                </span>
              )}
            </div>
            {isExpanded ? (
              <>
                <div className="ml-3 border-l border-gray-600">
                  {level < 3 ? (
                    <Widget
                      src={`${ownerId}/widget/includes.Common.TreeReceipts.TreeNode`}
                      props={{
                        node: value,
                        path: newPath,
                        ownerId,
                      }}
                    />
                  ) : (
                    <>
                      <div className="ml-2 pl-8">
                        {JSON.stringify(value, null, 2)}
                      </div>
                    </>
                  )}
                </div>
                <div className="text-green-500 dark:text-green-250 pt-1 ml-3 font-semibold">{` }`}</div>
              </>
            ) : (
              <></>
            )}
          </div>
        );
      });
    } else {
      return (
        <>
          <div className="pl-8 text-nearblue-600 dark:text-neargray-10 w-full">
            {`${node}`}
          </div>
        </>
      );
    }
  };

  return <div className="w-full">{renderNode(node, path, 0)}</div>;
}
