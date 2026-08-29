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
import { getProvider, viewAccount, viewCode } from '#libs/near';
import { dbBase, dbContract, pgp } from '#libs/pgp';
import redis from '#libs/redis';
import { rollingWindow } from '#libs/response';
import { abiSchema } from '#libs/utils';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/accounts';

type Deployment = {
  block_timestamp: string;
  receipt_id: string;
};

const EMPTY_CODE_HASH = '11111111111111111111111111111111';

type RpcContract = {
  code_base64: null | string;
  code_hash: null | string;
  global_account_id: null | string;
  global_code_hash: null | string;
};

const EMPTY_CONTRACT: RpcContract = {
  code_base64: null,
  code_hash: null,
  global_account_id: null,
  global_code_hash: null,
};

const contractCode = (account: string): Promise<null | RpcContract> =>
  redis.cache<null | RpcContract>(
    `v3:contract:${account}:code`,
    async () => {
      try {
        const provider = getProvider();
        const acc = (await viewAccount(provider, account)) as {
          code_hash?: string;
          global_contract_account_id?: string;
          global_contract_hash?: string;
        };

        const globalAccountId = acc?.global_contract_account_id ?? null;
        const globalCodeHash = acc?.global_contract_hash ?? null;
        const hasCode =
          (!!acc?.code_hash && acc.code_hash !== EMPTY_CODE_HASH) ||
          !!globalAccountId ||
          !!globalCodeHash;

        if (!hasCode) return EMPTY_CONTRACT;

        const code = (await viewCode(provider, account)) as {
          code_base64?: string;
          hash?: string;
        };

        if (!code?.code_base64 || !code?.hash) return EMPTY_CONTRACT;

        return {
          code_base64: code.code_base64,
          code_hash: code.hash,
          global_account_id: globalAccountId,
          global_code_hash: globalCodeHash,
        };
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

    // TEMP
    // const data = await dbContract.oneOrNone<Contract>(sql.contracts.contract, {
    //   account,
    // });
    //
    // if (!data) return { data: null };
    //
    // const isGlobal =
    //   !data.code_base64 && !!(data.global_account_id || data.global_code_hash);
    //
    // if (isGlobal) {
    //   const rpc = await globalCode(account);
    //   if (rpc) {
    //     return {
    //       data: {
    //         ...data,
    //         code_base64: rpc.code_base64,
    //         code_hash: rpc.hash,
    //       },
    //     };
    //   }
    // }
    //
    // return { data };

    const rpc = await contractCode(account);

    if (!rpc?.code_base64) return { data: null };

    return {
      data: {
        account_id: account,
        code_base64: rpc.code_base64,
        code_hash: rpc.code_hash,
        global_account_id: rpc.global_account_id,
        global_code_hash: rpc.global_code_hash,
      },
    };
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
      { label: 'account.contract.first', start: config.baseStart },
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
      { label: 'account.contract.last', start: config.baseStart },
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

    // TEMP
    // const data = await dbContract.oneOrNone<Contract>(sql.contracts.contract, {
    //   account,
    // });
    //
    // if (!data) {
    //   return { data: null };
    // }

    const provider = getProvider();

    const [code, schema] = await Promise.all([
      (async () => {
        const rpc = await contractCode(account);
        const codeBase64 = rpc?.code_base64 ?? null;

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

    const data = await rollingWindow(
      (start, end) => {
        return dbBase.oneOrNone<Contract>(sql.contracts.action, {
          account,
          end,
          method,
          start,
        });
      },
      { label: 'account.contract.action', start: config.baseStart },
    );

    return { data };
  },
);

export default { action, contract, deployments, schema };
