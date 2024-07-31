import type { DependencyList, Dispatch, SetStateAction } from 'react';

declare global {
  function useState<T>(
    initialState: (() => T) | T,
  ): [T, Dispatch<SetStateAction<T>>];
  function useState<T = undefined>(): [
    T | undefined,
    Dispatch<SetStateAction<T | undefined>>,
  ];

  function useMemo<T>(
    factory: () => T,
    deps: DependencyList | null | undefined,
  ): T;

  function useEffect(
    effect: () => (() => undefined | void) | void,
    deps: DependencyList | null | undefined,
  ): void;

  function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: DependencyList | null | undefined,
  ): T;
}
