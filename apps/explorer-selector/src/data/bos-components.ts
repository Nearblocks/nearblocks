import type { NetworkId } from "@/utils/types";

type NetworkComponents = {
  home: string;
};

export const componentsByNetworkId: Record<
  NetworkId,
  NetworkComponents | undefined
> = {
  testnet: {
    home: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/ExplorerSelector`,
  },

  mainnet: {
    home: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/ExplorerSelector`,
  },
};
