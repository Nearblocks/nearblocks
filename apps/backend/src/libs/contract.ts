import knex from './knex.js';

export const upsertErrorContract = async (
  contract: string,
  type: string,
  token: null | string,
) => {
  const row = await knex('errored_contracts')
    .where('contract', contract)
    .where('type', type)
    .where('token', token)
    .first();

  if (row) {
    return await knex('errored_contracts')
      .where('id', row.id)
      .update({ attempts: +row.attempts + 1 });
  }

  return await knex('errored_contracts').insert({
    attempts: 1,
    contract,
    token,
    type,
  });
};
