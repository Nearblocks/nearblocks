import { RPC } from 'nb-near';

import config from '#config';

export default new RPC(config.rpcUrl);
