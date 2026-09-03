import { RPC } from 'nb-near';

import config from '#config';

export const rpc = config.rpcUrl ? new RPC(config.rpcUrl) : undefined;
