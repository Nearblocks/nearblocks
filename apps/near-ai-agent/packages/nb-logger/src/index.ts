import { pino } from 'pino';

const options =
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
