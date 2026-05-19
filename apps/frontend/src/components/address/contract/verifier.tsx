'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { useView } from '@/hooks/use-rpc';
import { useSettings } from '@/hooks/use-settings';
import {
  ContractSourceMetadata,
  ContractVerifierResponse,
} from '@/types/types';
import { Alert, AlertDescription } from '@/ui/alert';
import { Button } from '@/ui/button';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/ui/field';
import { Input } from '@/ui/input';
import { NativeSelect, NativeSelectOption } from '@/ui/native-select';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  account?: string;
  codeHash: null | string;
  heading: string;
};

export const VerifyContract = ({ account, codeHash, heading }: Props) => {
  const { t } = useLocale('address');
  const verifier = useConfig((s) => s.config.verifier);
  const network = useConfig((s) => s.config.network);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hydrated = useSettings((s) => s.hydrated);

  const { data: sourceMetadata, isLoading: isLoadingMetadata } =
    useView<ContractSourceMetadata | null>(
      account
        ? {
            args: {},
            contract: account,
            method: 'contract_source_metadata',
          }
        : null,
    );

  const { data: verifierResponse, isLoading: isLoadingVerifier } =
    useView<ContractVerifierResponse | null>(
      codeHash
        ? {
            args: { code_hash: codeHash },
            contract: verifier.contract,
            method: 'get_contracts_by_code_hash',
          }
        : null,
    );

  const verifierData = verifierResponse?.[0]?.[1] || null;
  const isVerified = !!codeHash && verifierData?.code_hash === codeHash;
  const hasNep330 = sourceMetadata?.standards?.some(
    (s) => s.standard.toLowerCase() === 'nep330',
  );
  const allFieldsExist =
    hasNep330 &&
    sourceMetadata?.build_info?.build_environment &&
    sourceMetadata?.build_info?.source_code_snapshot;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    setIsSubmitting(true);
    try {
      const resp = await fetch(verifier.api.verify, {
        body: JSON.stringify({ accountId: account, networkId: network }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const result = await resp.json();
      if (resp.ok) {
        toast.success(result.message ?? t('verifyContract.successMessage'));
      } else {
        let errorMsg = result?.message ?? t('verifyContract.errorMessage');
        const jsonStart = errorMsg?.indexOf('{');
        if (jsonStart !== -1) {
          try {
            const parsed = JSON.parse(errorMsg.substring(jsonStart));
            errorMsg = parsed.error ?? errorMsg;
          } catch {}
        }
        toast.error(errorMsg);
      }
    } catch {
      toast.error(t('verifyContract.errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-headline-2xl mb-6">{heading}</h1>

        {!account && (
          <Alert className="bg-amber-background mb-4 border-0">
            <AlertDescription className="text-amber-foreground text-body-xs">
              {t('verifyContract.noAccount')}
            </AlertDescription>
          </Alert>
        )}

        {account && (!hydrated || isLoadingMetadata || isLoadingVerifier) && (
          <div className="mb-4 flex flex-col gap-3">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}

        {account &&
          hydrated &&
          !isLoadingMetadata &&
          sourceMetadata === undefined && (
            <Alert className="bg-red-background mb-4 border-0">
              <AlertDescription className="text-red-foreground text-body-xs">
                <p className="font-semibold">
                  {t('verifyContract.notFound.title')}
                </p>
                <p className="mt-1">
                  {t('verifyContract.notFound.description')}
                </p>
              </AlertDescription>
            </Alert>
          )}

        {account &&
          hydrated &&
          !isLoadingMetadata &&
          sourceMetadata !== undefined &&
          hasNep330 === false && (
            <Alert className="bg-red-background mb-4 border-0">
              <AlertDescription className="text-red-foreground text-body-xs">
                <p className="font-semibold">
                  {t('verifyContract.nep330.title')}
                </p>
                <p className="mt-1">{t('verifyContract.nep330.description')}</p>
              </AlertDescription>
            </Alert>
          )}

        {account && hydrated && !isLoadingMetadata && isVerified && (
          <Alert className="bg-teal-background mb-4 border-0">
            <AlertDescription className="text-teal-foreground text-body-xs">
              {t('verifyContract.alreadyVerified')}
            </AlertDescription>
          </Alert>
        )}

        {account &&
          hydrated &&
          !isLoadingMetadata &&
          hasNep330 &&
          !isVerified && (
            <Alert className="bg-amber-background mb-4 border-0">
              <AlertDescription className="text-amber-foreground text-body-xs">
                <p className="font-semibold">
                  {t('verifyContract.instructions.title')}
                </p>
                <p className="mt-1">
                  {t('verifyContract.instructions.description')}{' '}
                  <a
                    className="font-bold underline"
                    href="https://github.com/SourceScan/verification-guide"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('verifyContract.instructions.link')}
                  </a>{' '}
                  {t('verifyContract.instructions.suffix')}
                </p>
              </AlertDescription>
            </Alert>
          )}

        {account &&
          hydrated &&
          !isLoadingMetadata &&
          !isLoadingVerifier &&
          sourceMetadata !== undefined && (
            <form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit}>
              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel htmlFor="verifier-select">
                    {t('verifyContract.form.verifier')}
                  </FieldLabel>
                  <FieldContent>
                    <NativeSelect
                      disabled
                      id="verifier-select"
                      value={verifier.contract}
                    >
                      <NativeSelectOption value={verifier.contract}>
                        {verifier.contract}
                      </NativeSelectOption>
                    </NativeSelect>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="standard-input">
                    {t('verifyContract.form.standard')}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      disabled
                      id="standard-input"
                      value={
                        sourceMetadata?.standards
                          ?.map((s) => `${s.standard}:v${s.version}`)
                          .join(', ') ?? ''
                      }
                    />
                    {!hasNep330 && (
                      <p className="text-destructive text-body-xs mt-1">
                        {t('verifyContract.form.nep330Required')}
                      </p>
                    )}
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="address-input">
                    {t('verifyContract.form.address')}
                  </FieldLabel>
                  <FieldContent>
                    <Input disabled id="address-input" value={account} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="language-select">
                    {t('verifyContract.form.language')}
                  </FieldLabel>
                  <FieldContent>
                    <NativeSelect disabled id="language-select" value="rust">
                      <NativeSelectOption value="rust">Rust</NativeSelectOption>
                      <NativeSelectOption disabled value="javascript">
                        JavaScript
                      </NativeSelectOption>
                    </NativeSelect>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="build-env-input">
                    {t('verifyContract.form.buildEnv')}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      disabled
                      id="build-env-input"
                      value={
                        sourceMetadata?.build_info?.build_environment ?? ''
                      }
                    />
                    {!sourceMetadata?.build_info?.build_environment && (
                      <p className="text-destructive text-body-xs mt-1">
                        {t('verifyContract.form.buildEnvRequired')}
                      </p>
                    )}
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="source-code-input">
                    {t('verifyContract.form.sourceCode')}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      disabled
                      id="source-code-input"
                      value={
                        sourceMetadata?.build_info?.source_code_snapshot ?? ''
                      }
                    />
                    {!sourceMetadata?.build_info?.source_code_snapshot && (
                      <p className="text-destructive text-body-xs mt-1">
                        {t('verifyContract.form.sourceCodeRequired')}
                      </p>
                    )}
                  </FieldContent>
                </Field>

                <Field>
                  <Button
                    disabled={
                      isLoadingMetadata ||
                      isLoadingVerifier ||
                      isSubmitting ||
                      !allFieldsExist ||
                      isVerified
                    }
                    type="submit"
                    variant="secondary"
                  >
                    {t('verifyContract.form.submit')}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          )}
      </div>
    </div>
  );
};
