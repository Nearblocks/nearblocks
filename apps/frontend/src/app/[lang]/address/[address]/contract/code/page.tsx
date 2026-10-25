/* eslint-disable nb/require-hold-nav -- data is fully awaited before render (no streaming boundary), so the segment holds implicitly */
import { redirect } from 'next/navigation';

import { ContractCode } from '@/components/address/contract/code';
import { fetchContract } from '@/data/address/contract';
import { getRuntimeConfig } from '@/lib/config';
import { encodeArgs } from '@/lib/rpc';
import { relayRpc } from '@/lib/rpc-upstream';
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
  try {
    // This page fully awaits, so cap each upstream attempt to bound TTFB.
    const { body } = await relayRpc(
      JSON.stringify({
        id: 'nearblocks',
        jsonrpc: '2.0',
        method: 'query',
        params: {
          account_id: contract,
          args_base64: encodeArgs(args),
          finality: 'final',
          method_name: method,
          request_type: 'call_function',
        },
      }),
      false,
      5_000,
    );
    const bytes = (JSON.parse(body) as { result?: { result?: number[] } })
      .result?.result;

    return bytes ? (JSON.parse(Buffer.from(bytes).toString()) as T) : null;
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
