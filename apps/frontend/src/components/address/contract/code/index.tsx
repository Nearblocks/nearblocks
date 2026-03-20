'use client';

import { RiCodeSSlashLine, RiQuestionLine } from '@remixicon/react';
import { useMemo } from 'react';

import { Contract } from 'nb-schemas';

import { Copy } from '@/components/copy';
import { IpfsSourceViewer } from '@/components/ipfs';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { useView } from '@/hooks/use-rpc';
import { downloadWasm, getCommitHash } from '@/lib/utils';
import {
  ContractSourceMetadata,
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
  const { t } = useLocale('address');
  const verifier = useConfig((s) => s.config.verifier);

  const { data: sourceMetadata, isLoading: isLoadingMetadata } =
    useView<ContractSourceMetadata | null>({
      args: {},
      contract: contract.account_id,
      method: 'contract_source_metadata',
    });
  const { data: verifierResponse, isLoading: isLoadingVerifier } =
    useView<ContractVerifierResponse | null>({
      args: { code_hash: contract.code_hash },
      contract: verifier.contract,
      method: 'get_contracts_by_code_hash',
    });

  const verifierData = useMemo(() => {
    return verifierResponse?.[0]?.[1] || null;
  }, [verifierResponse]);

  const info = useMemo(() => {
    const isNep330 =
      sourceMetadata?.standards?.some(
        (s) => s.standard.toLowerCase() === 'nep330',
      ) || false;
    const isVerified = verifierData?.code_hash === contract.code_hash;

    return { isNep330, isVerified };
  }, [sourceMetadata, verifierData, contract.code_hash]);

  return (
    <>
      <Info
        account={contract.account_id}
        isNep330={info.isNep330}
        isVerified={info.isVerified}
        loading={isLoadingMetadata || isLoadingVerifier}
      />
      {isLoadingMetadata || isLoadingVerifier ? (
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
                    <TooltipContent>
                      {t('contract.code.versionTip')}
                    </TooltipContent>
                  </Tooltip>{' '}
                  {t('contract.code.version')}
                </ListLeft>
                <ListRight>
                  <p className="truncate">
                    {sourceMetadata.version || t('contract.code.na')}
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
                      {t('contract.code.standardTip')}
                    </TooltipContent>
                  </Tooltip>{' '}
                  {t('contract.code.standard')}
                </ListLeft>
                <ListRight>
                  <p className="truncate">
                    {sourceMetadata.standards
                      ?.map((s) => `${s.standard}:v${s.version}`)
                      .join(', ') || t('contract.code.na')}
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
                      {t('contract.code.sourceTip')}
                    </TooltipContent>
                  </Tooltip>{' '}
                  {t('contract.code.snapshot')}
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
                    t('contract.code.na')
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
                      {t('contract.code.ipfsTip')}
                    </TooltipContent>
                  </Tooltip>{' '}
                  {t('contract.code.ipfs')}
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
                    t('contract.code.na')
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
                      {t('contract.code.buildEnvTip')}
                    </TooltipContent>
                  </Tooltip>{' '}
                  {t('contract.code.buildEnv')}
                </ListLeft>
                <ListRight>
                  <p className="truncate">
                    {sourceMetadata?.build_info?.build_environment ||
                      t('contract.code.na')}
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
                      {t('contract.code.buildCommandTip')}
                    </TooltipContent>
                  </Tooltip>{' '}
                  {t('contract.code.buildCommand')}
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
                    t('contract.code.na')
                  )}
                </ListRight>
              </ListItem>
            </List>
          </div>
          <div className="mb-4 px-1">
            <p className="text-muted-foreground flex items-center gap-1 py-2.5">
              <RiCodeSSlashLine className="size-4" />{' '}
              {t('contract.code.sourceCode')}
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
            <RiCodeSSlashLine className="size-4" /> {t('contract.code.base64')}
          </span>
          <Button
            onClick={() =>
              downloadWasm(contract.account_id, contract.code_base64 || '')
            }
            size="xs"
            variant="secondary"
          >
            {t('contract.code.downloadWasm')}
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
