import http from 'http';

import { logger } from 'nb-logger';

import { register } from './prom.js';

const PORT = 3010;

export const server = http.createServer(async (req, res) => {
  if (req.url === '/metrics') {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () =>
  logger.info(`metrics server listening on port ${PORT}`),
);
