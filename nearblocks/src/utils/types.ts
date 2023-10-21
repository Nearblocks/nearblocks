import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";

export type NextPageWithLayout<T = any> = NextPage<T> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type NetworkId = ProductionNetwork["networkId"];
export type Network = ProductionNetwork;

type ProductionNetwork = {
  networkId: "testnet" | "mainnet";
};
