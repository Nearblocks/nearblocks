import { setupWalletSelector } from "@near-wallet-selector/core";
import {
  CommitButton,
  EthersProviderContext,
  useCache,
  useInitNear,
  useNear,
  Widget,
} from "near-social-vm";
import React, { useEffect } from "react";

import { useVmStore } from "@/stores/vm";
import { networkId } from "@/utils/config";

export default function VmInitializer() {
  const { initNear } = useInitNear();
  const near = useNear();
  const cache = useCache();
  const setVmStore = useVmStore((store) => store.set);

  useEffect(() => {
    initNear &&
      initNear({
        networkId,
        walletConnectCallback: () => {},
        selector: setupWalletSelector({
          network: networkId,
          modules: [],
        }),
      });
  }, [initNear]);

  useEffect(() => {
    setVmStore({
      cache,
      CommitButton,
      EthersProvider: EthersProviderContext.Provider,
      Widget,
      near,
    });
  }, [cache, setVmStore, near]);

  return <></>;
}
