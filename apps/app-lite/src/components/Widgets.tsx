'use client';
import { useInitNear, Widget } from 'near-social-vm';
import Link, { LinkProps } from 'next/link';
import { ReactNode, useEffect } from 'react';

import config from '@/config';
import { useWidgetStore } from '@/stores/widgets';

import JsonView from './JsonView';
import Skeleton from './Skeleton';
import { AddressKeysSkeleton, AddressSkeleton } from './Skeletons/Address';
import { BlockSkeleton } from './Skeletons/Block';
import { ErrorIconSkeleton, ErrorSkeleton } from './Skeletons/Error';
import {
  HomeChartSkeleton,
  HomeSkeleton,
  HomeStatsSkeleton,
} from './Skeletons/Home';
import {
  TxnActionSkeleton,
  TxnAddressSkeleton,
  TxnExecutionSkeleton,
  TxnReceiptSkeleton,
  TxnSkeleton,
  TxnTabsSkeleton,
} from './Skeletons/Txn';

type WidgetsProps = {
  loader?: ReactNode;
  props?: object;
  src: string;
};

const Links = (
  props: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
    LinkProps & {
      children?: React.ReactNode;
    } & React.RefAttributes<HTMLAnchorElement>,
) => <Link {...props} />;

const selector = async () => ({
  store: { observable: { subscribe: () => {} } },
  wallet: async () => ({
    getAccounts: async () => [''],
    metadata: { walletUrl: '' },
    signAndSendTransaction: async () => {},
  }),
});

const Widgets = ({ loader, props, src }: WidgetsProps): ReactNode => {
  const { initNear } = useInitNear();
  const redirectMap = useWidgetStore((state) => state.widgets);
  const configs = { redirectMap };

  useEffect(() => {
    initNear &&
      initNear({
        customElements: {
          AddressKeysSkeleton,
          AddressSkeleton,
          BlockSkeleton,
          ErrorIconSkeleton,
          ErrorSkeleton,
          HomeChartSkeleton,
          HomeSkeleton,
          HomeStatsSkeleton,
          JsonView,
          Link: Links,
          Skeleton,
          TxnActionSkeleton,
          TxnAddressSkeleton,
          TxnExecutionSkeleton,
          TxnReceiptSkeleton,
          TxnSkeleton,
          TxnTabsSkeleton,
        },
        networkId: config.network,
        selector: selector(),
      });
  }, [initNear]);

  return <Widget config={configs} loading={loader} props={props} src={src} />;
};

export default Widgets;
