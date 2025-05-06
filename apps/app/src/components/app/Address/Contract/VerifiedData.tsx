import React, { useEffect, useRef, useState } from 'react';
import { ContractMetadata, VerifierData } from '@/utils/types';
import ErrorMessage from '../../common/ErrorMessage';
import FaCode from '../../Icons/FaCode';
import FaInbox from '../../Icons/FaInbox';
import CodeViewer from './CodeViewer';
import { toast } from 'react-toastify';
import { useParams } from 'next/navigation';
import { useRpcStore } from '@/stores/app/rpc';
import { useRpcProvider } from '@/hooks/app/useRpcProvider';
import { useConfig } from '@/hooks/app/useConfig';
import { isEmpty } from 'lodash';

type VerifiedDataProps = {
  base64Code: string;
  contractMetadata: ContractMetadata | null;
  selectedVerifier: string;
  verifierData: VerifierData;
};

const VerifiedData: React.FC<VerifiedDataProps> = ({
  base64Code,
  contractMetadata,
  selectedVerifier,
  verifierData,
}) => {
  const [fileData, setFileData] = useState<{ content: string; name: string }[]>(
    [],
  );
  const [fileDataLoading, setFileDataLoading] = useState(true);
  const [fileDataError, setFileDataError] = useState<null | string>(null);
  const params = useParams<{ id: string }>();
  const contractId = params?.id?.toLowerCase();
  const initializedRef = useRef(false);
  const { verifierConfig } = useConfig();

  const useRpcStoreWithProviders = () => {
    const setProviders = useRpcStore((state) => state.setProviders);
    const { RpcProviders } = useRpcProvider();
    useEffect(() => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        setProviders(RpcProviders);
      }
    }, [RpcProviders, setProviders]);

    return useRpcStore((state) => state);
  };

  const { switchRpc } = useRpcStoreWithProviders();

  useEffect(() => {
    const fetchCode = async () => {
      try {
        setFileDataLoading(true);
        const files = await fetchFilesData(
          selectedVerifier,
          verifierData,
          contractMetadata,
        );
        if (files) setFileData(files);
      } catch (error) {
        switchRpc();
        setFileDataError('Failed to fetch files.');
      } finally {
        setFileDataLoading(false);
      }
    };

    if (verifierData) fetchCode();
    else {
      setFileDataError(null);
      setFileDataLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVerifier, verifierData, contractMetadata, switchRpc]);

  const fetchFilesData = async (
    selectedVerifier: string,
    verifierData: VerifierData,
    contractMetadata: ContractMetadata | null,
  ) => {
    const verifier = verifierConfig.find(
      (c) => c.accountId === selectedVerifier,
    );
    const cid = verifierData?.cid;
    const path = contractMetadata?.build_info?.contract_path || 'src';
    try {
      if (!cid || !verifier) return;
      const fetchStructure = async (path: string) => {
        const res = await fetch(verifier.fileStructureApiUrl(cid, path));
        if (!res.ok)
          throw new Error(`Failed to fetch structure at path: ${path}`);
        return await res.json();
      };

      const getFiles = async (path = ''): Promise<string[]> => {
        const data = await fetchStructure(path);
        const files: string[] = [];
        for (const item of data?.structure || []) {
          const fullPath = `${path}${path ? '/' : ''}${item.name}`;
          if (item.type === 'file') files.push(fullPath);
          else if (item.type === 'dir')
            files.push(...(await getFiles(fullPath)));
        }
        return files;
      };

      const files = await getFiles(path);
      const fileContents = await Promise.all(
        files.map(async (filePath) => {
          const res = await fetch(verifier.sourceCodeApiUrl(cid, filePath));
          if (!res.ok)
            throw new Error(`Failed to fetch content for ${filePath}`);
          return { content: await res.text(), name: filePath };
        }),
      );
      return fileContents.filter((file) => file.content !== null);
    } catch (error) {
      setFileDataError('Failed to fetch files.');
      return;
    }
  };

  const downloadContractWasm = () => {
    try {
      const binaryString = window.atob(base64Code);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/wasm' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const filename = contractId ? `${contractId}.wasm` : 'contract.wasm';
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading contract WASM:', error);
      toast.error(
        <div className="whitespace-nowrap text-sm">
          Failed to download. Please try again.
        </div>,
      );
    }
  };

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
      ></div>
    );
  };

  return (
    <div className="w-full">
      <div className="h-full bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10 divide-y dark:divide-black-200">
        <div className="flex flex-wrap py-4 px-1.5">
          <div className="w-full">
            <div className="flex items-center justify-between">
              {!fileDataLoading && (
                <div className="flex items-center">
                  <FaCode className="mr-2" />
                  <span className="font-bold">
                    {!isEmpty(fileData) && !fileDataLoading
                      ? 'Contract Source Code'
                      : 'Base64 Encoded Contract Code'}
                  </span>
                </div>
              )}
              {isEmpty(fileData) && !fileDataLoading && (
                <button
                  onClick={downloadContractWasm}
                  className="flex items-center lg:!text-sm text-xs text-white my-1 text-center font-normal pl-2 pr-1 py-[5px] whitespace-nowrap dark:bg-green-250 bg-green-500 rounded-md"
                >
                  <span className="mr-1">Download .wasm</span>
                </button>
              )}
            </div>

            {fileDataLoading ? (
              <Loader wrapperClassName="w-full md:w-full" />
            ) : (
              <>
                {fileDataError && !base64Code ? (
                  <ErrorMessage
                    icons={<FaInbox />}
                    message={fileDataError}
                    mutedText="Please try again later"
                  />
                ) : fileData && fileData.length > 0 ? (
                  <div className="pt-4">
                    {fileData.map((file) => (
                      <CodeViewer
                        content={file.content}
                        key={file.name}
                        language="rust"
                        name={file.name}
                      />
                    ))}
                  </div>
                ) : (
                  <textarea
                    className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200  p-3 mt-3 resize-y"
                    readOnly
                    rows={4}
                    style={{
                      height: '300px',
                      overflowX: 'hidden',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                    }}
                    value={base64Code}
                  ></textarea>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifiedData;
