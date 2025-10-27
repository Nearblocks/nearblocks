import * as v from 'valibot';

const account = v.object({
  account: v.string(),
});

const balance = v.object({
  account: v.string(),
});

const contract = v.object({
  account: v.string(),
});

const deployments = v.object({
  account: v.string(),
});

const schema = v.object({
  account: v.string(),
});

const action = v.object({
  account: v.string(),
  method: v.string(),
});

export type AccountReq = v.InferOutput<typeof account>;
export type AccountBalanceReq = v.InferOutput<typeof balance>;
export type ContractReq = v.InferOutput<typeof contract>;
export type ContractDeploymentsReq = v.InferOutput<typeof deployments>;
export type ContractSchemaReq = v.InferOutput<typeof schema>;
export type ContractActionReq = v.InferOutput<typeof action>;

export default { account, action, balance, contract, deployments, schema };
