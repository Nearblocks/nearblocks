'use client';

import { use } from 'react';

import { Contract } from 'nb-schemas';

import { ActiveLink } from '@/components/link';
import { TabLink } from '@/components/tab-links';
import { useLocale } from '@/hooks/use-locale';

type Props = {
  address: string;
  contractPromise: Promise<Contract | null>;
};

export const ContractTab = ({ address, contractPromise }: Props) => {
  const { t } = useLocale('address');
  const contract = use(contractPromise);

  if (!contract) return null;

  return (
    <TabLink asChild>
      <ActiveLink exact={false} href={`/address/${address}/contract`}>
        {t('contract.tab')}
      </ActiveLink>
    </TabLink>
  );
};
