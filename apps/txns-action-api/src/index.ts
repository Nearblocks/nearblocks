import dotenv from 'dotenv';
dotenv.config();
import config from './config';
import logger from './libs/logger';
import app from './app';

app.listen(config.port, () => {
  logger.info(`Transaction parser API listening on port ${config.port}`);
});

process.once('SIGINT', () => process.exit(0));
process.once('SIGTERM', () => process.exit(0));
