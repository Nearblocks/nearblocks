import axios from 'axios';

import { logger } from 'nb-logger';

import { IntentsToken } from '#types/types';

const price = async (): Promise<IntentsToken[] | null> => {
  try {
    const resp = await axios.get(`https://1click.chaindefuser.com/v0/tokens`, {
      timeout: 60000,
    });

    return resp?.data ?? null;
  } catch (error) {
    logger.error(`price: intents.price`);
    logger.error(error);
    return null;
  }
};

export default { price };
