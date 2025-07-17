import { Response } from 'express';

import catchAsync from '#libs/async';
import { fetchMeta } from '#libs/fetchMeta';
import { RequestValidator } from '#types/types';

type MetaRequest = {
  contract: string;
  token_id: string;
};

const metadata = catchAsync(
  async (req: RequestValidator<MetaRequest>, res: Response) => {
    const { contract, token_id } = req.validator.data;

    const metas = await fetchMeta(contract, token_id);

    return res.status(200).json(metas);
  },
);

export default { metadata };
