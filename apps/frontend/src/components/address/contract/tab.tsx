'use client';

import { use } from 'react';

import { Contract } from 'nb-schemas';

import { ActiveLink } from '@/components/link';
import { TabLink } from '@/components/tab-links';

type Props = {
  address: string;
  contractPromise: Promise<Contract | null>;
};

export const ContractTab = ({ address, contractPromise }: Props) => {
  const contract = use(contractPromise);

  if (!contract) return null;

  return (
    <TabLink asChild>
      <ActiveLink exact={false} href={`/address/${address}/contract`}>
        Contract
      </ActiveLink>
    </TabLink>
  );
};
