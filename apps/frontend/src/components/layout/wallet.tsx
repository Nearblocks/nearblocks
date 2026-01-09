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
  const network = useConfig((c) => c.networkId);
  const mainnetUrl = useConfig((c) => c.mainnetUrl);
  const testnetUrl = useConfig((c) => c.testnetUrl);
  const providers = useConfig((c) => c.providers);
  const projectId = useConfig((c) => c.reownProjectId);
  const { t } = useLocale('layout');
  const [account, setAccount] = useState<string>();
  const [connector, setConnector] = useState<NearConnector>();

  useEffect(() => {
    let isMounted = true;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      try {
        const url = network === 'mainnet' ? mainnetUrl : testnetUrl;
        const rpcs = providers.map((rpc) => rpc.url);
        const walletConnect = SignClient.init({
          metadata: {
            description:
              'NEAR Blocks is the leading blockchain explorer dedicated to the NEAR ecosystem. Powered by NEAR Protocol.',
            icons: ['/favicon.ico'],
            name: 'NearBlocks',
            url,
          },
          projectId,
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
  }, [mainnetUrl, network, projectId, providers, testnetUrl]);

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
