import { dbContracts } from '#libs/knex';
import { resetFTMeta } from '#services/fts/meta';
import { resetMTMeta } from '#services/mts/meta';
import { resetNFTMeta } from '#services/nfts/meta';
import { MetaContract, Raw } from '#types/types';

export const resetMeta = async () => {
  const { rows: deployments } = await fetchDeployments();
  const contracts = deployments.map((deployment) => deployment.contract);

  if (contracts.length) {
    await Promise.all([
      resetFTMeta(contracts),
      resetMTMeta(contracts),
      resetNFTMeta(contracts),
    ]);
  }
};

export const fetchDeployments = async () => {
  return dbContracts.raw<Raw<MetaContract>>(
    `
      SELECT
        contract_account_id AS contract
      FROM
        (
          SELECT DISTINCT
            ON (contract_account_id) contract_account_id,
            event_type
          FROM
            contract_code_events
          WHERE
            block_timestamp > (
              EXTRACT(
                EPOCH
                FROM
                  NOW() - INTERVAL '1 day'
              ) * 1e9
            )::BIGINT
          ORDER BY
            contract_account_id,
            block_timestamp DESC,
            shard_id DESC,
            index_in_chunk DESC
        ) latest
      WHERE
        latest.event_type = 'UPDATE'
    `,
  );
};
