import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino(
  isProduction
    ? {}
    : {
        transport: {
          options: {
            colorize: true,
          },
          target: 'pino-pretty',
        },
      },
);

export default logger;
