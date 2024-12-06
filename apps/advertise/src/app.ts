import express, { Request, Response } from 'express';

import logger from '#libs/logger';
import routes from '#routes/index';

const app = express();

app.use('/v1', routes());

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((err: Error, _req: Request, res: Response) => {
  logger.error(err);
  res.status(500).json({ message: 'Server Error' });
});

export default app;
