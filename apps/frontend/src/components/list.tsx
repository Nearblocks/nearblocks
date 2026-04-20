import * as React from 'react';

import { cn } from '@/lib/utils';

export type ListProps = React.ComponentProps<'div'> & {
  /**
   * Number of label/value "pairs" per row on desktop.
   * - 1 => [left][right]
   * - 2 => [left][right][left][right]
   */
  pairsPerRow?: 1 | 2;
};

const mdGridColsByPairs: Record<
  NonNullable<ListProps['pairsPerRow']>,
  string
> = {
  1: 'md:grid-cols-[max-content_minmax(0,1fr)]',
  2: 'md:grid-cols-[auto_max-content] lg:grid-cols-[max-content_auto_max-content_auto]',
};

const List = ({
  children,
  className,
  pairsPerRow = 1,
  ...props
}: ListProps) => {
  const childrenArray = React.Children.toArray(children);
  const items = childrenArray.filter(
    (child): child is React.ReactElement<ListItemProps> =>
      React.isValidElement<ListItemProps>(child) && child.type === ListItem,
  );

  const totalRows = Math.ceil(items.length / pairsPerRow);
  let itemIndex = 0;

  const enhancedChildren = childrenArray.map((child) => {
    if (!React.isValidElement<ListItemProps>(child) || child.type !== ListItem)
      return child;

    const isLastItem = itemIndex === items.length - 1;
    const rowIndex = Math.floor(itemIndex / pairsPerRow);
    const isLastRow = rowIndex === totalRows - 1;

    const cloned = React.cloneElement(child, {
      'data-last-item': String(isLastItem),
      'data-last-row': String(isLastRow),
      key: child.key ?? itemIndex,
    });

    itemIndex += 1;
    return cloned;
  });

  return (
    <div
      className={cn(
        'text-body-sm flex w-full flex-col items-center md:grid md:items-start',
        mdGridColsByPairs[pairsPerRow],
        className,
      )}
      data-pairs-per-row={pairsPerRow}
      data-slot="list-content"
      {...props}
    >
      {enhancedChildren}
    </div>
  );
};

export type ListItemProps = React.ComponentProps<'div'> & {
  /**
   * Internal attributes injected by `List` for styling.
   */
  'data-last-item'?: string;
  'data-last-row'?: string;
};

const ListItem = ({ className, ...props }: ListItemProps) => {
  return (
    <div
      className={cn(
        'group/list-item flex w-full flex-col md:contents',
        'border-b data-[last-item=true]:border-b-0 md:border-b-0',
        className,
      )}
      data-slot="list-item"
      {...props}
    />
  );
};

export type ListLeftProps = React.ComponentProps<'h3'>;

const ListLeft = ({ className, ...props }: ListLeftProps) => {
  return (
    <h3
      className={cn(
        'text-muted-foreground border-b-0 px-3 py-2 md:py-2',
        'overflow-hidden md:flex md:items-center md:self-stretch group-data-[last-row=true]/list-item:md:border-b-0',
        className,
      )}
      data-slot="list-left"
      {...props}
    />
  );
};

export type ListRightProps = React.ComponentProps<'div'>;

const ListRight = ({ className, ...props }: ListRightProps) => {
  return (
    <div
      className={cn(
        'w-full min-w-0 border-b-0 px-3 py-2 md:py-2',
        'overflow-hidden md:flex md:items-center md:self-stretch group-data-[last-row=true]/list-item:md:border-b-0',
        className,
      )}
      data-slot="list-right"
      {...props}
    />
  );
};

export { List, ListItem, ListLeft, ListRight };
