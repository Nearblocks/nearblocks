'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  AccordionRoot,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
} from '@/components/ui/accordion';
import FaCode from '@/components/app/Icons/FaCode';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { TransactionActionInfo } from '@/utils/types';
import { useRpcProvider } from '@/components/app/common/RpcContext';
import {
  calculateWasmSize,
  formatBytes,
  detectWasmLanguage,
  downloadWasm,
  extractWasmMethods,
} from '@/utils/wasm';
import useRpc from '@/hooks/app/useRpc';
import { Spinner } from '@/components/app/common/Spinner';

const DeployContract = (props: TransactionActionInfo) => {
  const t = useTranslations();
  const { receiver, args } = props;
  const { rpc } = useRpcProvider();
  const { getContractCode } = useRpc();

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contractData, setContractData] = useState<{
    codeBase64?: string;
    codeHash?: string;
    size?: number;
    language?: string;
    methods?: string[];
  } | null>(null);

  const codeHashFromArgs = args?.code_hash;

  useEffect(() => {
    const fetchContractData = async () => {
      if (!receiver || contractData) return;

      setLoading(true);
      try {
        const result = await getContractCode(rpc, receiver);

        if (result && result.codeBase64 && result.codeHash) {
          const size = calculateWasmSize(result.codeBase64);
          const language = detectWasmLanguage(result.codeBase64);
          const methods = extractWasmMethods(result.codeBase64);

          if (size === 0) {
            toast.error('Failed to load contract data: invalid WASM file.');
            console.warn('Invalid WASM size, skipping contract data');
            return;
          }

          setContractData({
            codeBase64: result.codeBase64,
            codeHash: result.codeHash,
            size,
            language,
            methods: methods.length > 0 ? methods : undefined,
          });
        }
      } catch (error) {
        console.error('Error fetching contract data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiver, rpc]);

  const handleDownloadWasm = () => {
    if (!contractData?.codeBase64) return;

    const filename = receiver ? `${receiver}.wasm` : 'contract.wasm';
    const success = downloadWasm(contractData.codeBase64, filename);

    if (!success) {
      toast.error('Failed to download WASM file');
    }
  };

  return (
    <div className="py-1">
      <AccordionRoot collapsible id={`contract-${receiver}`}>
        <AccordionItem value={receiver}>
          <div className="inline-flex items-center flex-wrap">
            <FaCode className="inline-flex text-emerald-400 mr-1" />{' '}
            <span>
              {t ? t('txnDetails.actions.deployContract.0') : 'Contract'} (
              <Link
                className="text-green-500 dark:text-green-250 font-bold hover:no-underline"
                href={`/address/${receiver}`}
              >
                {shortenAddress(receiver)}
              </Link>
              ) {t ? t('txnDetails.actions.deployContract.1') : 'deployed'}
            </span>
            <span className="inline-flex ml-1">
              <AccordionItemTrigger
                buttonColor="text-green-500 dark:text-green-250"
                className="focus:outline-none text-green-500 dark:text-green-250 inline-flex items-center cursor-pointer text-sm"
                indicatorPlacement="start"
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded
                  ? 'Hide deployment details'
                  : 'Show deployment details'}
              </AccordionItemTrigger>
            </span>
          </div>

          <AccordionItemContent className="py-0">
            <div className="mt-3 bg-gray-50 dark:bg-black-200 rounded-lg text-xs border dark:border-black-200">
              {loading ? (
                <div className="flex items-center text-nearblue-600 dark:text-neargray-10 gap-x-2 p-3">
                  <Spinner />
                  Loading contract details...
                </div>
              ) : contractData ? (
                <>
                  <div className="p-3 max-h-[350px] md:max-h-[450px] overflow-y-auto space-y-2">
                    <div className="flex flex-wrap items-start">
                      <span className="font-semibold text-nearblue-600 dark:text-neargray-10 w-32">
                        WASM Size:
                      </span>
                      <span className="text-nearblue-600 dark:text-neargray-10">
                        {contractData.size
                          ? formatBytes(contractData.size)
                          : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-start">
                      <span className="font-semibold text-nearblue-600 dark:text-neargray-10 w-32 flex-shrink-0">
                        Code Hash:
                      </span>
                      <span className="text-nearblue-600 dark:text-neargray-10 break-words font-mono flex-1 min-w-0">
                        {contractData.codeHash || codeHashFromArgs || 'N/A'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-start">
                      <span className="font-semibold text-nearblue-600 dark:text-neargray-10 w-32">
                        Language:
                      </span>
                      <span className="text-nearblue-600 dark:text-neargray-10">
                        {contractData.language || 'Unknown'}
                      </span>
                    </div>

                    {contractData.methods &&
                      Array.isArray(contractData.methods) &&
                      contractData.methods.length > 0 && (
                        <div className="flex flex-wrap items-start">
                          <span className="font-semibold text-nearblue-600 dark:text-neargray-10 w-32">
                            Methods:
                          </span>
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-1">
                              {contractData.methods.map((method, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-nearblue-600 dark:text-neargray-10 rounded"
                                >
                                  {method}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  {contractData.codeBase64 && (
                    <div className="sticky bottom-0 p-3 pt-0 bg-gray-50 dark:bg-black-200">
                      <div className="pt-3 border-t dark:border-black-600">
                        <button
                          onClick={handleDownloadWasm}
                          className="px-2.5 py-1 bg-green-500 dark:bg-green-250 text-white rounded-md hover:bg-green-600 dark:hover:bg-green-200 transition-colors"
                        >
                          Download WASM
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : codeHashFromArgs ? (
                <div className="space-y-2 p-3">
                  <div className="flex flex-wrap items-start">
                    <span className="font-semibold text-nearblue-600 dark:text-neargray-10 w-32">
                      Code Hash:
                    </span>
                    <span className="text-nearblue-600 dark:text-neargray-10 break-all font-mono">
                      {codeHashFromArgs}
                    </span>
                  </div>
                  <div className="text-nearblue-600 dark:text-neargray-10">
                    Contract details not available. The contract may have been
                    redeployed or deleted.
                  </div>
                </div>
              ) : (
                <div className="text-nearblue-600 dark:text-neargray-10 p-3">
                  Unable to load contract details
                </div>
              )}
            </div>
          </AccordionItemContent>
        </AccordionItem>
      </AccordionRoot>
    </div>
  );
};

export default DeployContract;
