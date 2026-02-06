import * as v from 'valibot';

import { jsonSchema, responseSchema } from '../common.js';

const accountCreated = v.object({
  block_timestamp: v.optional(v.string()),
  transaction_hash: v.optional(v.string()),
});

const accountDeleted = v.object({
  block_timestamp: v.optional(v.string()),
  transaction_hash: v.optional(v.string()),
});

const account = v.object({
  account_id: v.string(),
  created: accountCreated,
  deleted: accountDeleted,
  locked: v.boolean(),
});

const balance = v.object({
  account_id: v.string(),
  amount: v.string(),
  amount_staked: v.string(),
  storage_usage: v.string(),
});

const contract = v.object({
  account_id: v.string(),
  code_base64: v.nullable(v.string()),
  code_hash: v.nullable(v.string()),
});

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const deployment = v.object({
  block,
  predecessor_account_id: v.string(),
  transaction_hash: v.string(),
});

const schema = v.object({
  account_id: v.string(),
  method_names: v.array(v.string()),
  schema: jsonSchema,
});

const action = v.object({
  args: jsonSchema,
});

const accountResponse = responseSchema(account);
const balanceResponse = responseSchema(balance);
const contractResponse = responseSchema(contract);
const deploymentResponse = responseSchema(v.array(deployment));
const schemaResponse = responseSchema(schema);
const actionResponse = responseSchema(action);

export type Account = v.InferOutput<typeof account>;
export type AccountBalance = v.InferOutput<typeof balance>;
export type Contract = v.InferOutput<typeof contract>;
export type ContractDeployment = v.InferOutput<typeof deployment>;
export type ContractSchema = v.InferOutput<typeof schema>;
export type ContractAction = v.InferOutput<typeof action>;

export type AccountRes = v.InferOutput<typeof accountResponse>;
export type AccountBalanceRes = v.InferOutput<typeof balanceResponse>;
export type ContractRes = v.InferOutput<typeof contractResponse>;
export type ContractDeploymentRes = v.InferOutput<typeof deploymentResponse>;
export type ContractSchemaRes = v.InferOutput<typeof schemaResponse>;
export type ContractActionRes = v.InferOutput<typeof actionResponse>;

export default {
  account: accountResponse,
  action: actionResponse,
  balance: balanceResponse,
  contract: contractResponse,
  deployments: deploymentResponse,
  schema: schemaResponse,
};
