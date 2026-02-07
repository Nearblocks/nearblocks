'use client';

import { useEffect, useMemo, useState } from 'react';
import { RiCodeSSlashLine, RiQuestionLine } from 'react-icons/ri';

import { Contract } from 'nb-schemas';

import { Copy } from '@/components/copy';
import { IpfsSourceViewer } from '@/components/ipfs';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { useConfig } from '@/hooks/use-config';
import { viewFunction } from '@/lib/rpc';
import { downloadWasm, getCommitHash } from '@/lib/utils';
import {
  ContractSourceMetadata,
  ContractVerifierData,
  ContractVerifierResponse,
} from '@/types/types';
import { Button } from '@/ui/button';
import { Skeleton } from '@/ui/skeleton';
import { Textarea } from '@/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { Info } from './info';

type Props = {
  contract: Contract;
};

export const ContractCode = ({ contract }: Props) => {
  const verifier = useConfig((s) => s.verifier);
  const [loading, setLoading] = useState({
    metadata: false,
    verifier: false,
  });
  const [verifierData, setVerifierData] = useState<ContractVerifierData | null>(
    null,
  );
  const [sourceMetadata, setSourceMetadata] =
    useState<ContractSourceMetadata | null>(null);
  const info = useMemo(() => {
    const isNep330 =
      sourceMetadata?.standards?.some(
        (s) => s.standard.toLowerCase() === 'nep330',
      ) || false;
    const isVerified = verifierData?.code_hash === contract.code_hash;

    return { isNep330, isVerified };
  }, [sourceMetadata, verifierData, contract.code_hash]);

  useEffect(() => {
    if (contract.account_id) {
      setLoading((loading) => ({ ...loading, metadata: true }));
      viewFunction<ContractSourceMetadata | null>(
        contract.account_id,
        'contract_source_metadata',
        {},
      )
        .then((data) => setSourceMetadata(data))
        .catch((error) => console.error(error))
        .finally(() =>
          setLoading((loading) => ({ ...loading, metadata: false })),
        );
    }
  }, [contract.account_id]);

  useEffect(() => {
    if (contract.code_hash && verifier.contract) {
      setLoading((loading) => ({ ...loading, verifier: true }));
      viewFunction<ContractVerifierResponse | null>(
        verifier.contract,
        'get_contracts_by_code_hash',
        { code_hash: contract.code_hash },
      )
        .then((data) => {
          setVerifierData(data?.[0]?.[1] || null);
        })
        .catch((error) => console.error(error))
        .finally(() =>
          setLoading((loading) => ({ ...loading, verifier: false })),
        );
    }
  }, [contract.code_hash, verifier.contract]);

  return (
    <>
      <Info
        account={contract.account_id}
        isNep330={info.isNep330}
        isVerified={info.isVerified}
        loading={loading.metadata || loading.verifier}
      />
      {loading.metadata || loading.verifier ? (
        <>
          <div className="mb-6.5">
            <Skeleton className="h-118 w-full lg:h-36.5" />
          </div>
          <div className="mb-2.5">
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="border-border overflow-hidden rounded-lg border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="border-b px-3 py-2 last:border-b-0" key={i}>
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </>
      ) : null}
      {sourceMetadata && verifierData && (
        <>
          <div className="mb-4 grid xl:grid-cols-2">
            <List className="overflow-hidden" pairsPerRow={1}>
              <ListItem>
                <ListLeft className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <RiQuestionLine className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>Version of the contract</TooltipContent>
                  </Tooltip>{' '}
                  Version:
                </ListLeft>
                <ListRight>
                  <p className="truncate">{sourceMetadata.version || 'N/A'}</p>
                </ListRight>
              </ListItem>
              <ListItem>
                <ListLeft className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <RiQuestionLine className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Standards used by the contract
                    </TooltipContent>
                  </Tooltip>{' '}
                  Standard:
                </ListLeft>
                <ListRight>
                  <p className="truncate">
                    {sourceMetadata.standards
                      ?.map((s) => `${s.standard}:v${s.version}`)
                      .join(', ') || 'N/A'}
                  </p>
                </ListRight>
              </ListItem>
              <ListItem>
                <ListLeft className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <RiQuestionLine className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Snapshot of the contract source code
                    </TooltipContent>
                  </Tooltip>{' '}
                  Source snapshot:
                </ListLeft>
                <ListRight className="flex items-center xl:py-2.5">
                  {sourceMetadata.build_info?.source_code_snapshot ? (
                    <>
                      <a
                        className="text-link block truncate"
                        href={sourceMetadata.build_info.source_code_snapshot}
                      >
                        {getCommitHash(
                          sourceMetadata.build_info.source_code_snapshot,
                        )}
                      </a>
                      <Copy
                        text={sourceMetadata.build_info.source_code_snapshot}
                      />
                    </>
                  ) : (
                    'N/A'
                  )}
                </ListRight>
              </ListItem>
            </List>
            <List className="overflow-hidden" pairsPerRow={1}>
              <ListItem>
                <ListLeft className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <RiQuestionLine className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      IPFS hash of the contract source code
                    </TooltipContent>
                  </Tooltip>{' '}
                  IPFS:
                </ListLeft>
                <ListRight className="flex items-center xl:py-2.5">
                  {verifierData?.cid ? (
                    <>
                      <a
                        className="text-link block truncate"
                        href={`${verifier.ipfs}/${verifierData.cid}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {verifierData.cid}
                      </a>{' '}
                      <Copy text={verifierData.cid} />
                    </>
                  ) : (
                    'N/A'
                  )}
                </ListRight>
              </ListItem>
              <ListItem>
                <ListLeft className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <RiQuestionLine className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Environment in which the contract was built
                    </TooltipContent>
                  </Tooltip>{' '}
                  Build Environment:
                </ListLeft>
                <ListRight>
                  <p className="truncate">
                    {sourceMetadata?.build_info?.build_environment || 'N/A'}
                  </p>
                </ListRight>
              </ListItem>
              <ListItem>
                <ListLeft className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <RiQuestionLine className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Build commands used to compile the contract
                    </TooltipContent>
                  </Tooltip>{' '}
                  Build Command:
                </ListLeft>
                <ListRight className="flex items-center xl:py-2.5">
                  {sourceMetadata?.build_info?.build_command?.length > 0 ? (
                    <>
                      <p className="truncate">
                        {sourceMetadata?.build_info?.build_command?.join(' ')}
                      </p>
                      <Copy
                        className="inline-block align-middle"
                        text={sourceMetadata?.build_info?.build_command?.join(
                          ' ',
                        )}
                      />
                    </>
                  ) : (
                    'N/A'
                  )}
                </ListRight>
              </ListItem>
            </List>
          </div>
          <div className="mb-4 px-1">
            <p className="text-muted-foreground flex items-center gap-1 py-2.5">
              <RiCodeSSlashLine className="size-4" /> Contract Source Code:
            </p>
            <IpfsSourceViewer
              api={verifier.api.list}
              cid={verifierData.cid}
              gateway={verifier.ipfs}
              path={sourceMetadata?.build_info?.contract_path}
            />
          </div>
        </>
      )}
      <div className="px-1">
        <div className="text-muted-foreground flex items-center justify-between gap-1 py-2.5">
          <span className="flex items-center gap-1">
            <RiCodeSSlashLine className="size-4" /> Contract Code (Base64):
          </span>
          <Button
            onClick={() =>
              downloadWasm(contract.account_id, contract.code_base64 || '')
            }
            size="xs"
            variant="secondary"
          >
            Download .wasm
          </Button>
        </div>
        <Textarea
          className="scroll-overlay max-h-40"
          readOnly
          value={contract.code_base64 || ''}
        />
      </div>
    </>
  );
};
