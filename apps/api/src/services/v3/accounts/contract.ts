import { unionWith } from 'es-toolkit';
import parser from 'near-contract-parser';

import type {
  Contract,
  ContractActionReq,
  ContractDeployment,
  ContractReq,
  ContractSchemaReq,
} from 'nb-schemas';
import response from 'nb-schemas/dist/accounts/response.js';

import { getProvider } from '#libs/near.js';
import { dbBase, dbContract, pgp } from '#libs/pgp';
import redis from '#libs/redis';
import { rollingWindow } from '#libs/response.js';
import { abiSchema } from '#libs/utils.js';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/accounts';

const contract = responseHandler(
  response.contract,
  async (req: RequestValidator<ContractReq>) => {
    const account = req.validator.account;

    const data = await dbContract.oneOrNone<Contract>(sql.contracts.contract, {
      account,
    });

    return { data };
  },
);

const deployments = responseHandler(
  response.deployments,
  async (req: RequestValidator<ContractReq>) => {
    const account = req.validator.account;

    const first = await rollingWindow((start, end) => {
      return dbContract.oneOrNone<
        Pick<ContractDeployment, 'block_timestamp' | 'receipt_id'>
      >(sql.contracts.deployments, {
        account,
        end,
        order: 'ASC',
        start,
      });
    });

    const last = await rollingWindow((start, end) => {
      return dbContract.oneOrNone<
        Pick<ContractDeployment, 'block_timestamp' | 'receipt_id'>
      >(sql.contracts.deployments, {
        account,
        end,
        order: 'DESC',
        start,
      });
    });

    if (!first && !last) {
      return { data: [] };
    }

    const receipts =
      first && last
        ? unionWith([first], [last], (a, b) => a.receipt_id === b.receipt_id)
        : first
        ? [first]
        : [last];

    const queries = receipts.map((event) => {
      return pgp.as.format(sql.contracts.deploymentTxn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');

    const data =
      await dbBase.manyOrNone<
        Pick<ContractDeployment, 'block' | 'transaction_hash'>
      >(unionQuery);

    return { data };
  },
);

const schema = responseHandler(
  response.schema,
  async (req: RequestValidator<ContractSchemaReq>) => {
    const account = req.validator.account;

    const data = await dbContract.oneOrNone<Contract>(sql.contracts.contract, {
      account,
    });

    if (!data || !data?.code_base64) {
      return { data: null };
    }

    const codeBase64 = data.code_base64;
    const provider = getProvider();
    const [parsed, schema] = await Promise.all([
      (async () => {
        try {
          return await parser.parseContract(codeBase64);
        } catch (error) {
          return null;
        }
      })(),
      redis.cache(
        `contract:${account}:abi`,
        async () => {
          try {
            return await abiSchema(provider, account);
          } catch (error) {
            return null;
          }
        },
        60 * 5, // 5 mins
      ),
    ]);

    return {
      data: {
        account_id: account,
        method_names: parsed ? parsed.methodNames : [],
        schema,
      },
    };
  },
);

const action = responseHandler(
  response.action,
  async (req: RequestValidator<ContractActionReq>) => {
    const account = req.validator.account;
    const method = req.validator.method;

    const data = await dbBase.oneOrNone<Contract>(sql.contracts.action, {
      account,
      method,
    });

    return { data };
  },
);

export default { action, contract, deployments, schema };
