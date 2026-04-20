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

import config from '#config';
import { getProvider, viewCode } from '#libs/near';
import { dbBase, dbContract, pgp } from '#libs/pgp';
import redis from '#libs/redis';
import { rollingWindow } from '#libs/response';
import { abiSchema } from '#libs/utils';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/accounts';

type RpcCode = { code_base64: string; hash: string } | null;
type Deployment = {
  block_timestamp: string;
  receipt_id: string;
};

const globalCode = (account: string): Promise<RpcCode> =>
  redis.cache<RpcCode>(
    `v3:contract:${account}:code`,
    async () => {
      try {
        const res = (await viewCode(getProvider(), account)) as {
          code_base64?: string;
          hash?: string;
        };
        if (!res?.code_base64 || !res?.hash) return null;

        return { code_base64: res.code_base64, hash: res.hash };
      } catch (error) {
        return null;
      }
    },
    60 * 5, // 5 mins
  );

const contract = responseHandler(
  response.contract,
  async (req: RequestValidator<ContractReq>) => {
    const account = req.validator.account;

    const data = await dbContract.oneOrNone<Contract>(sql.contracts.contract, {
      account,
    });

    if (!data) return { data: null };

    const isGlobal =
      !data.code_base64 && !!(data.global_account_id || data.global_code_hash);

    if (isGlobal) {
      const rpc = await globalCode(account);
      if (rpc) {
        return {
          data: {
            ...data,
            code_base64: rpc.code_base64,
            code_hash: rpc.hash,
          },
        };
      }
    }

    return { data };
  },
);

const deployments = responseHandler(
  response.deployments,
  async (req: RequestValidator<ContractReq>) => {
    const account = req.validator.account;

    const first = await rollingWindow(
      (start, end) => {
        return dbContract.oneOrNone<Deployment>(sql.contracts.deployments, {
          account,
          end,
          order: 'ASC',
          start,
        });
      },
      { start: config.baseStart },
    );

    const last = await rollingWindow(
      (start, end) => {
        return dbContract.oneOrNone<Deployment>(sql.contracts.deployments, {
          account,
          end,
          order: 'DESC',
          start,
        });
      },
      { start: config.baseStart },
    );

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

    const data = await dbBase.manyOrNone<ContractDeployment>(unionQuery);

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

    if (!data) {
      return { data: null };
    }

    const provider = getProvider();

    const [code, schema] = await Promise.all([
      (async () => {
        let codeBase64 = data.code_base64;
        const isGlobal =
          !data.code_base64 &&
          !!(data.global_account_id || data.global_code_hash);

        if (!codeBase64 && isGlobal) {
          const rpc = await globalCode(account);
          codeBase64 = rpc?.code_base64 ?? null;
        }

        if (!codeBase64) {
          return { codeBase64: null, parsed: null };
        }

        try {
          const parsed = await parser.parseContract(codeBase64);
          return { codeBase64, parsed };
        } catch (error) {
          return { codeBase64, parsed: null };
        }
      })(),
      redis.cache(
        `v3:contract:${account}:abi`,
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

    if (!code.codeBase64) {
      return { data: null };
    }

    return {
      data: {
        account_id: account,
        method_names: code.parsed ? code.parsed.methodNames : [],
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
