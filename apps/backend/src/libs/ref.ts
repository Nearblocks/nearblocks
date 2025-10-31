import axios from 'axios';

import { logger } from 'nb-logger';

import { RefData } from '#types/types';

const price = async (): Promise<null | RefData> => {
  try {
    const resp = await axios.get(
      `https://indexer.ref.finance/list-token-price`,
      { timeout: 60000 },
    );

    return resp?.data ?? null;
  } catch (error) {
    logger.error(`price: ref.price`);
    logger.error(error);
    return null;
  }
};

export default { price };
