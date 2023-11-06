import { NextApiRequest, NextApiResponse } from 'next';

const healthCheckHandler = (_: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ status: 'NearBlocks is healthy' });
};

export default healthCheckHandler;
