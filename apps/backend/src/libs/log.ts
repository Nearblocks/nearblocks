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
const log = pino(options);

export default log;
