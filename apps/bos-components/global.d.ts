declare const Widget: (params: {
  src?: string;
  props?: object;
  loading?: React.ReactNode;
}) => React.ReactNode;

declare const useState: <T>(
  initialState: T,
) => [T, React.Dispatch<React.SetStateAction<T>>];
declare const useEffect: (
  effect: React.EffectCallback,
  deps?: React.DependencyList,
) => void;

declare namespace Near {
  function asyncView(
    contractName: string,
    methodName: string,
    args?: object,
    blockId?: string | number,
  ): Promise;
}

declare const styled;
declare const asyncFetch;
declare const useCache;
declare const Big;
declare const Popover;
declare const Tooltip;
declare const Dialog;
declare const Select;
declare const ScrollArea;
declare const Buffer;
declare const useMemo;
declare const Tabs;
declare const Accordion;
declare const Fragment;
declare const useCallback;
declare const Markdown;
declare const InfiniteScroll;
declare const Files;
declare const Link;
declare const CommitButton;
declare const VM;
declare const Toast;
declare const Switch;
declare const OverlayTrigger;
declare const ethers;
