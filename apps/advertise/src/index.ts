import config from '#config';
import logger from '#libs/logger';

import app from './app.js';

app.listen(config.port, async () => {
  logger.info(`server listening on port ${config.port}`);
});
