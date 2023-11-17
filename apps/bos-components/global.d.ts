declare const Widget: (params: {
  src: string;
  props: object;
}) => React.ReactNode;

declare const useState: <T>(
  initialState: T,
) => [T, React.Dispatch<React.SetStateAction<T>>];
declare const useEffect: (
  effect: React.EffectCallback,
  deps?: React.DependencyList,
) => void;

declare const styled;
declare const asyncFetch;
