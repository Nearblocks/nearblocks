'use client';

import { useContext, useEffect, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

import { AccordionRoot } from '@/components/ui/accordion';
import useRpc from '@/hooks/app/useRpc';
import { verifierConfig } from '@/utils/app/config';
import {
  ContractCodeInfo,
  ContractData,
  ContractParseInfo,
  SchemaInfo,
  VerificationData,
  VerifierStatus,
} from '@/utils/types';

import Tooltip from '../../common/Tooltip';
import { NearContext } from '../../wallet/near-context';
import ContractCode from './ContractCode';
import Info from './Info';
import ViewOrChange from './ViewOrChange';
import ViewOrChangeAbi from './ViewOrChangeAbi';
import { shortenAddress } from '@/utils/libs';
import { useParams } from 'next/navigation';

interface Props {
  accountId?: string;
  contract: ContractCodeInfo;
  contractInfo: ContractParseInfo;
  deployments: any;
  isLocked?: boolean;
  logOut?: () => void;
  requestSignInWithWallet?: () => void;
  schema?: SchemaInfo;
}

type OnChainResponse = {
  code_base64?: string;
  hash?: string;
};

const verifiers = verifierConfig.map((config) => config.accountId);

const OverviewActions = (props: Props) => {
  const { signedAccountId, wallet } = useContext(NearContext);
  const { accountId, contractInfo, deployments, isLocked, schema } = props;
  const params = useParams<{ id: string }>();

  const [tab, setTab] = useState(0);

  const onTabChange = (index: number) => setTab(index);

  const [contractData, setContractData] = useState<ContractData>({
    base64Code: '',
    contractMetadata: null,
    onChainCodeHash: '',
  });

  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const { contractCode, getContractMetadata, getVerifierData } = useRpc();
  const [verificationData, setVerificationData] = useState<
    Record<string, VerificationData>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setStatusLoading(true);
        setError(null);

        const onChainResponse = await contractCode(accountId as string);

        const contractMetadataResponse = await getContractMetadata(
          accountId as string,
        );

        const onChainHash = (onChainResponse as OnChainResponse)?.hash || '';

        const base64Code =
          (onChainResponse as OnChainResponse)?.code_base64 || '';

        setContractData({
          base64Code: base64Code,
          contractMetadata: contractMetadataResponse,
          onChainCodeHash: onChainHash,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch contract data');
      }
    };
    if (accountId) fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  useEffect(() => {
    const fetchVerifierData = async () => {
      setStatusLoading(true);

      try {
        const verifierDataPromises = verifiers.map((verifierAccountId) =>
          getVerifierData(accountId as string, verifierAccountId),
        );

        const verifierResponses = await Promise.all(verifierDataPromises);

        const verificationData = verifiers.reduce<
          Record<string, VerificationData>
        >((acc, verifier, index) => {
          const data = verifierResponses[index];
          let status: VerifierStatus = 'notVerified';

          if (
            data &&
            contractData?.onChainCodeHash &&
            contractData?.contractMetadata
          ) {
            const hashMatches =
              contractData?.onChainCodeHash === data?.code_hash;
            status = hashMatches
              ? 'verified'
              : contractData?.contractMetadata?.build_info
              ? 'mismatch'
              : 'notVerified';
          }

          acc[verifier] = {
            data,
            status,
          };
          return acc;
        }, {});

        setVerificationData(verificationData);
      } catch (error) {
        console.error('Error fetching or updating verifier data:', error);
        setError('Failed to fetch verifier data');
      } finally {
        setStatusLoading(false);
      }
    };
    if (contractData.onChainCodeHash) fetchVerifierData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, contractData]);

  return (
    <Tabs
      className={'pb-1 px-4 py-3'}
      onSelect={onTabChange}
      selectedIndex={tab}
    >
      <TabList className={'flex flex-wrap gap-x-1 gap-y-2 pt-2'}>
        <Tab
          className={`px-2.5 mr-1 border dark:border-black-200 py-1.5 text-xs font-semibold rounded-lg cursor-pointer outline-none 
    text-nearblue-600 dark:text-neargray-10 hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 dark:hover:bg-black-100`}
          selectedClassName="!bg-green-600 dark:!bg-green-250 !text-white"
        >
          Contract Info
        </Tab>
        <Tab
          className={`px-2.5 mr-1 border dark:border-black-200 py-1.5 text-xs font-semibold rounded-lg cursor-pointer outline-none 
    text-nearblue-600 dark:text-neargray-10 hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 dark:hover:bg-black-100`}
          selectedClassName="!bg-green-600 dark:!bg-green-250 !text-white"
        >
          Contract Code
        </Tab>
        <Tab
          className={`px-2.5 mr-1 border dark:border-black-200 py-1.5 text-xs font-semibold rounded-lg cursor-pointer outline-none 
    text-nearblue-600 dark:text-neargray-10 hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 dark:hover:bg-black-100`}
          selectedClassName="!bg-green-600 dark:!bg-green-250 !text-white"
        >
          Contract Methods
        </Tab>
      </TabList>
      <TabPanel>
        <Info
          data={deployments}
          id={params?.id}
          isLocked={isLocked as boolean}
        />
      </TabPanel>
      <TabPanel>
        <ContractCode
          accountId={accountId as string}
          contractData={contractData}
          error={error}
          statusLoading={statusLoading}
          verificationData={verificationData}
        />
      </TabPanel>
      {!schema && (
        <TabPanel>
          <div className="py-4 px-1 mt-3">
            {signedAccountId ? (
              <Tooltip
                className={'left-1/2 mt-3 max-w-[200px] whitespace-nowrap'}
                position="bottom"
                tooltip="Disconnect Wallet"
              >
                <button
                  className="px-1.5 mr-1 bg-white dark:bg-black-600 py-1.5 text-xs font-medium rounded-md text-nearblue-600 dark:text-neargray-10 inline-flex items-center border dark:border-gray-800  hover:bg-gray-100 dark:hover:bg-black-200"
                  onClick={wallet?.signOut}
                >
                  <span className="h-3 w-3 inline-block rounded-full mr-2 bg-neargreen" />
                  {`Connected - [${shortenAddress(signedAccountId)}]`}
                </button>
              </Tooltip>
            ) : (
              <button
                className="px-1.5 mr-1 bg-white dark:bg-black-600 py-1 text-xs font-medium rounded-md text-nearblue-600 dark:text-neargray-10 inline-flex items-center border dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-black-200"
                onClick={wallet?.signIn}
              >
                <span className="h-3 w-3 inline-block rounded-full mr-2 bg-red-500 animate-pulse" />
                Connect to Contract
              </button>
            )}
          </div>
          {!schema && (
            <p className="text-xs mx-1 text-nearblue-600 dark:text-neargray-10 mb-4 bg-gray-100 dark:bg-black-200 px-2 py-2  w-fit rounded shadow">
              {`Near ABI schema not found, We have provide a best effort “auto detect” facility to find successful methods and parameters from past transactions. If you are the contract owner please consider recompiling your contract with Near`}{' '}
              <a
                className="text-green-500 dark:text-green-250"
                href="https://github.com/near/abi"
                rel="noreferrer noopener nofollow"
                target="_blank"
              >
                ABI
              </a>
              .
            </p>
          )}
          {contractInfo?.methodNames?.length > 0 && (
            <AccordionRoot
              className="contract-accordian text-gray-600 px-1 pt-4 border-t dark:border-black-200"
              collapsible
              multiple
            >
              {contractInfo?.methodNames?.map((method: any, index: number) => (
                <ViewOrChange
                  id={params?.id}
                  index={index}
                  key={index}
                  method={method}
                />
              ))}
            </AccordionRoot>
          )}
        </TabPanel>
      )}
      {schema && schema?.body?.functions.length > 0 && (
        <TabPanel>
          <div className="py-4 px-1 mt-3">
            {signedAccountId ? (
              <Tooltip
                className={'left-1/2 mt-3 max-w-[200px] whitespace-nowrap'}
                position="bottom"
                tooltip="Disconnect Wallet"
              >
                <button
                  className="px-1.5 mr-1 bg-white dark:bg-black-600 py-1.5 text-xs font-medium rounded-md text-nearblue-600 dark:text-neargray-10 inline-flex items-center border dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-black-200"
                  onClick={wallet?.signOut}
                >
                  <span className="h-3 w-3 inline-block rounded-full mr-2 bg-neargreen" />
                  {`Connected - [${shortenAddress(signedAccountId)}]`}
                </button>
              </Tooltip>
            ) : (
              <button
                className="px-1.5 mr-1 bg-white dark:bg-black-600 py-1.5 text-xs font-medium rounded-md text-nearblue-600 dark:text-neargray-10 inline-flex items-center border dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-black-200"
                onClick={wallet?.signIn}
              >
                <span className="h-3 w-3 inline-block rounded-full mr-2 bg-red-500 animate-pulse" />
                Connect to Contract
              </button>
            )}
          </div>
          <p className="text-xs mx-1 text-nearblue-600 dark:text-neargray-10 mb-4 bg-gray-100 dark:bg-black-200 px-2 py-2  w-fit rounded shadow">
            Methods and parameters are automatically shown from the embedded
            Near{' '}
            <a
              className="text-green-500 dark:text-green-250"
              href="https://github.com/near/abi"
              rel="noreferrer noopener nofollow"
              target="_blank"
            >
              ABI
            </a>{' '}
            {`Schema.`}
          </p>
          <AccordionRoot
            className="contract-accordian text-gray-600 px-1 pt-4 border-t dark:border-black-200"
            collapsible
            multiple
          >
            {schema?.body?.functions?.map((func: any, index: number) => (
              <ViewOrChangeAbi
                id={params?.id}
                index={index}
                key={index}
                method={func}
                schema={schema}
              />
            ))}
          </AccordionRoot>
        </TabPanel>
      )}
    </Tabs>
  );
};

export default OverviewActions;
