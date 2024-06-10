'use client';
import { useInitNear, Widget } from 'near-social-vm';
import Link, { LinkProps } from 'next/link';
import { ReactNode, useEffect } from 'react';

import config from '@/config';
import { useWidgetStore } from '@/stores/widgets';

import JsonView from './JsonView';
import Skeleton from './Skeleton';

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
          JsonView,
          Link: Links,
          Skeleton,
        },
        networkId: config.network,
        selector: selector(),
      });
  }, [initNear]);

  return <Widget config={configs} loading={loader} props={props} src={src} />;
};

export default Widgets;
