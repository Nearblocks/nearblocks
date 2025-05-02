import { LoggerOptions, pino } from 'pino';

const options: LoggerOptions =
  process.env.NODE_ENV === 'production'
    ? {}
    : {
        transport: {
          options: {
            colorize: true,
          },
          target: 'pino-pretty',
        },
      };

export const logger = pino(options);
