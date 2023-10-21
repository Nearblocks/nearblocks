import type { NetworkId } from "@/utils/types";

type NetworkComponents = {
  nodeExplorer: string;
};

export const componentsByNetworkId: Record<
  NetworkId,
  NetworkComponents | undefined
> = {
  testnet: {
    nodeExplorer: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.NodeExplorer`,
  },

  mainnet: {
    nodeExplorer: `${process.env.NEXT_PUBLIC_ACCOUNT_ID}/widget/bos-components.components.NearBlocks.NodeExplorer`,
  },
};
