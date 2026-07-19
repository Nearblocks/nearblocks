/* eslint-disable no-restricted-syntax -- data is fully awaited before render (no streaming boundary), so the segment holds implicitly */
import { NearRpcClient, viewFunctionAsJson } from '@near-js/jsonrpc-client';
import { redirect } from 'next/navigation';

import { ContractCode } from '@/components/address/contract/code';
import { fetchContract } from '@/data/address/contract';
import { getRuntimeConfig, getServerConfig } from '@/lib/config';
import { encodeArgs } from '@/lib/rpc';
import {
  ContractSourceMetadata,
  ContractVerifierResponse,
} from '@/types/types';

type Props = PageProps<'/[lang]/address/[address]/contract/code'>;

// Verification state is resolved here over the upstream RPC (instead of
// client-side via useView) so the verified-source section is part of the
// initial HTML rather than inserting itself above the Base64 section once
// browser RPC resolves.
const view = async <T,>(
  contract: string,
  method: string,
  args: unknown,
): Promise<null | T> => {
  const config = getServerConfig();
  // This page fully awaits, so a hanging upstream would block TTFB — cap the
  // lookup instead of riding the client's 30s default with retries.
  const client = new NearRpcClient({
    endpoint: config.RPC_UPSTREAM_URL,
    retries: 1,
    timeout: 5_000,
    ...(config.RPC_UPSTREAM_KEY
      ? { headers: { Authorization: `Bearer ${config.RPC_UPSTREAM_KEY}` } }
      : {}),
  });

  try {
    return await viewFunctionAsJson<T>(client, {
      accountId: contract,
      argsBase64: encodeArgs(args),
      methodName: method,
    });
  } catch {
    // Non-NEP-330 contracts don't expose these methods; treat as unverified.
    return null;
  }
};

const CodePage = async ({ params }: Props) => {
  const { address } = await params;
  const contract = await fetchContract(address);

  if (!contract) return redirect(`/address/${address}`);

  const { verifier } = getRuntimeConfig();
  const [sourceMetadata, verifierResponse] = await Promise.all([
    view<ContractSourceMetadata>(
      contract.account_id,
      'contract_source_metadata',
      {},
    ),
    contract.code_hash
      ? view<ContractVerifierResponse>(
          verifier.contract,
          'get_contracts_by_code_hash',
          { code_hash: contract.code_hash },
        )
      : null,
  ]);

  return (
    <ContractCode
      contract={contract}
      sourceMetadata={sourceMetadata}
      verifierResponse={verifierResponse}
    />
  );
};

export default CodePage;
