import { useEffect, useState, RefObject } from 'react';

interface UseScrollToTopOptions {
  offset?: number;
}

const useScrollToTop = (
  ref: RefObject<HTMLElement> | null,
  options: UseScrollToTopOptions = {},
) => {
  const { offset = 5 } = options;
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const scrollContainer = ref?.current;

    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const atBottom =
        Math.abs(scrollHeight - (scrollTop + clientHeight)) <= offset;
      setIsAtBottom((prev) => {
        if (prev !== atBottom) {
          return atBottom;
        }
        return prev;
      });
    };

    handleScroll();

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [ref, offset]);

  const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
    ref?.current?.scrollTo({
      top: 0,
      behavior,
    });
  };

  return {
    isAtBottom,
    scrollToTop,
  };
};

export default useScrollToTop;
