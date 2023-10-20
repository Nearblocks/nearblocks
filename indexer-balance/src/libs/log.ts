import { pino } from 'pino';

const options =
  process.env.NODE_ENV === 'production'
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      };
const log = pino(options);

export default log;
