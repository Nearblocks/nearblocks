import { pino } from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino(
  isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      },
);

export default logger;
