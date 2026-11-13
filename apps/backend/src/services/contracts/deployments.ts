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
      resetNFTMeta(contracts),
      resetMTMeta(contracts),
    ]);
  }
};

// Latest effective event per account deployed in the last 2 days. A repeat
// UniversalStateInit (INIT whose previous event isn't absent/DELETE) is a no-op.
export const fetchDeployments = async () => {
  return dbContracts.raw<Raw<MetaContract>>(
    `
      SELECT
        contract_account_id AS contract
      FROM
        (
          SELECT DISTINCT
            ON (c.contract_account_id) c.contract_account_id,
            c.event_type
          FROM
            contract_code_events c
          WHERE
            c.block_timestamp > (
              EXTRACT(
                EPOCH
                FROM
                  NOW() - INTERVAL '2 days'
              ) * 1e9
            )::BIGINT
            AND (
              c.event_type <> 'INIT'
              OR COALESCE(
                (
                  SELECT
                    p.event_type
                  FROM
                    contract_code_events p
                  WHERE
                    p.contract_account_id = c.contract_account_id
                    AND p.block_timestamp <= c.block_timestamp
                    AND (p.block_timestamp, p.shard_id, p.index_in_chunk) < (
                      c.block_timestamp,
                      c.shard_id,
                      c.index_in_chunk
                    )
                  ORDER BY
                    p.block_timestamp DESC,
                    p.shard_id DESC,
                    p.index_in_chunk DESC
                  LIMIT
                    1
                ),
                'DELETE'
              ) = 'DELETE'
            )
          ORDER BY
            c.contract_account_id,
            c.block_timestamp DESC,
            c.shard_id DESC,
            c.index_in_chunk DESC
        ) latest
      WHERE
        latest.event_type IN ('UPDATE', 'INIT')
    `,
  );
};
