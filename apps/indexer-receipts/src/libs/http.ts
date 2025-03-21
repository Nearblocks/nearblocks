import http from 'http';

import { logger } from 'nb-logger';

import { register } from '#libs/prom';

const PORT = 3011;

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
