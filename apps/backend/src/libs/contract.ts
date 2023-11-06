import knex from './knex.js';

export const upsertErrorEntry = async (
  contract: string,
  type: string,
  token: null | string,
) => {
  const entry = await knex('error_contracts')
    .where('contract', contract)
    .where('type', type)
    .where('token', token)
    .first();

  if (entry) {
    return await knex('error_contracts')
      .where('id', entry.id)
      .update({ attempts: +entry.attempts + 1 });
  }

  return await knex('error_contracts').insert({
    attempts: 1,
    contract,
    token,
    type,
  });
};
