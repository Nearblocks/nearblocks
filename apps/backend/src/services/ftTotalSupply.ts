import dayjs from '#libs/dayjs';
import knex from '#libs/knex';
import { ftTotalSupply } from '#libs/near';
import { tokenAmount } from '#libs/utils';
import { FtMeta } from '#types/types';

export const getTokens = async () => {
  return knex('ft_meta').orderByRaw('rpccall_at ASC NULLS FIRST').limit(5);
};

export const updateTotalSupply = async (ftMeta: FtMeta) => {
  try {
    const data = await ftTotalSupply(ftMeta.contract);

    if (data) {
      const totalSupply = tokenAmount(data, ftMeta.decimals);

      return knex('ft_meta').where('contract', ftMeta.contract).update({
        rpccall_at: dayjs.utc().toISOString(),
        total_supply: +totalSupply,
      });
    }
  } catch (error) {
    //
  }

  return knex('ft_meta').where('contract', ftMeta.contract).update({
    rpccall_at: dayjs.utc().toISOString(),
  });
};
