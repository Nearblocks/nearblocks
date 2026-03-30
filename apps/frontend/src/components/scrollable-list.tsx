'use client';

import { ChevronsDown, ChevronsUp } from 'lucide-react';
import * as React from 'react';

import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { ScrollArea } from '@/ui/scroll-area';

const ScrollableList = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof ScrollArea>) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<Element | null>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);
  const [atBottom, setAtBottom] = React.useState(false);
  const { t } = useLocale('layout');

  const checkScroll = React.useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const scrollable = vp.scrollHeight > vp.clientHeight + 2;
    setIsScrollable(scrollable);
    setAtBottom(
      !scrollable || vp.scrollTop + vp.clientHeight >= vp.scrollHeight - 2,
    );
  }, []);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const vp = container.querySelector('[data-slot="scroll-area-viewport"]');
    if (!vp) return;
    viewportRef.current = vp;

    checkScroll();
    vp.addEventListener('scroll', checkScroll);

    const observer = new ResizeObserver(checkScroll);
    observer.observe(vp);
    // Also observe the inner content so we catch dynamic content changes
    if (vp.firstElementChild) observer.observe(vp.firstElementChild);

    return () => {
      vp.removeEventListener('scroll', checkScroll);
      observer.disconnect();
    };
  }, [checkScroll]);

  const scrollToBottom = () => {
    viewportRef.current?.scrollTo({
      behavior: 'smooth',
      top: viewportRef.current.scrollHeight,
    });
  };

  const scrollToTop = () => {
    viewportRef.current?.scrollTo({ behavior: 'smooth', top: 0 });
  };

  return (
    <div ref={containerRef}>
      <ScrollArea className={cn(className)} {...props}>
        {children}
      </ScrollArea>
      {isScrollable && (
        <Button
          className="!hover:bg-transparent !dark:hover:bg-transparent justify-start"
          onClick={atBottom ? scrollToTop : scrollToBottom}
          size="xs"
          variant="ghost"
        >
          {atBottom ? (
            <>
              <ChevronsUp className="size-3" />
              {t('scrollable.top')}
            </>
          ) : (
            <>
              <ChevronsDown className="size-3" />
              {t('scrollable.more')}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export { ScrollableList };
