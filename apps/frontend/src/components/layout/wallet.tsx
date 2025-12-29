'use client';

import { NearConnector } from '@hot-labs/near-connect';
import SignClient from '@walletconnect/sign-client';
import { useEffect, useState } from 'react';
import { LuCircleUserRound } from 'react-icons/lu';

import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';

type Props = {
  className?: string;
};

export const Wallet = ({ className }: Props) => {
  const config = useConfig();
  const { t } = useLocale('layout');
  const [account, setAccount] = useState<string>();
  const [connector, setConnector] = useState<NearConnector>();

  useEffect(() => {
    let isMounted = true;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      try {
        const network = config.NEXT_PUBLIC_NETWORK_ID;
        const url =
          network === 'mainnet'
            ? config.NEXT_PUBLIC_MAINNET_URL
            : config.NEXT_PUBLIC_TESTNET_URL;
        const rpcs = config.providers[network].map((rpc) => rpc.url);
        const walletConnect = SignClient.init({
          metadata: {
            description:
              'NEAR Blocks is the leading blockchain explorer dedicated to the NEAR ecosystem. Powered by NEAR Protocol.',
            icons: ['/favicon.ico'],
            name: 'NearBlocks',
            url,
          },
          projectId: config.NEXT_PUBLIC_REOWN_PROJECT_ID,
        });
        const connector = new NearConnector({
          logger: {
            log: (args: unknown) => console.log(args),
          },
          network,
          providers: { [network]: rpcs },
          walletConnect,
        });

        setConnector(connector);

        const onSignIn = (t: any) => {
          if (isMounted) {
            setAccount(t.accounts[0].accountId);
          }
        };

        const onSignOut = () => {
          if (isMounted) {
            setAccount(undefined);
          }
        };

        connector.on('wallet:signIn', onSignIn);
        connector.on('wallet:signOut', onSignOut);

        cleanup = () => {
          connector.off('wallet:signIn', onSignIn);
          connector.off('wallet:signOut', onSignOut);
        };

        const wallet = await connector.wallet().catch(() => {});
        const accounts = await wallet?.getAccounts().catch(() => []);

        if (isMounted && accounts && accounts.length > 0) {
          setAccount(accounts[0].accountId);
        }
      } catch (err) {
        console.error(err);
      }
    };

    init();

    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, [config]);

  const connect = async () => {
    try {
      if (!connector) return;
      if (account) return connector.disconnect();

      await connector.connect();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button
      className={cn(className, 'w-30 flex-row px-2')}
      onClick={() => connect()}
      size="xs"
    >
      <LuCircleUserRound />
      <span className="truncate">{account ?? t('menu.wallet.signIn')}</span>
    </Button>
  );
};
