import React, { useEffect, useState } from 'react';
import ErrorMessage from '@/components/common/ErrorMessage';
import FaCode from '@/components/Icons/FaCode';
import FaInbox from '@/components/Icons/FaInbox';
import { verifierConfig } from '@/utils/config';
import { ContractMetadata, VerifierData } from '@/utils/types';
import CodeViewer from '@/components/Address/Contract/CodeViewer';
import { useRpcStore } from '@/stores/rpc';

type VerifiedDataProps = {
  base64Code: string;
  contractMetadata: ContractMetadata | null;
  selectedVerifier: string;
  verifierData: VerifierData;
  contractId?: string;
};

const VerifiedData: React.FC<VerifiedDataProps> = ({
  base64Code,
  contractMetadata,
  selectedVerifier,
  verifierData,
  contractId,
}) => {
  const [fileData, setFileData] = useState<{ content: string; name: string }[]>(
    [],
  );
  const [fileDataLoading, setFileDataLoading] = useState(true);
  const [fileDataError, setFileDataError] = useState<null | string>(null);
  const switchRpc: () => void = useRpcStore((state) => state.switchRpc);
  useEffect(() => {
    const fetchCode = async () => {
      try {
        setFileDataLoading(true);
        const files = await fetchFilesData(
          selectedVerifier,
          verifierData,
          contractMetadata,
        );
        setFileData(files);
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
  }, [selectedVerifier, verifierData, contractMetadata, switchRpc]);

  const fetchFilesData = async (
    selectedVerifier: string,
    verifierData: VerifierData,
    contractMetadata: ContractMetadata | null,
  ) => {
    try {
      const verifier = verifierConfig.find(
        (config: { accountId: string }) =>
          config.accountId === selectedVerifier,
      );

      if (!verifier) throw new Error('Verifier configuration not found.');
      const cid = verifierData?.cid;
      if (!cid) throw new Error('CID not found.');

      const fetchStructure = async (path = '') => {
        const response = await fetch(verifier.fileStructureApiUrl(cid, path));
        if (!response.ok)
          throw new Error(`Failed to fetch structure at path: ${path}`);
        return await response.json();
      };

      const getFiles = async (path = ''): Promise<string[]> => {
        const data = await fetchStructure(path);
        const files: string[] = [];
        for (const item of data?.structure || []) {
          if (item.type === 'file') {
            files.push(`${path}${path ? '/' : ''}${item.name}`);
          } else if (item.type === 'dir') {
            files.push(...(await getFiles(`${path}/${item.name}`)));
          }
        }
        return files;
      };

      const path = contractMetadata?.build_info?.contract_path || 'src';
      const files = await getFiles(path);

      const fileContents = await Promise.all(
        files.map(async (filePath: string) => {
          const sourceCodeUrl = verifier.sourceCodeApiUrl(cid, filePath);
          const response = await fetch(sourceCodeUrl);
          if (!response.ok)
            throw new Error(`Failed to fetch content for ${filePath}`);
          return { content: await response.text(), name: filePath };
        }),
      );

      return fileContents.filter((file) => file.content !== null);
    } catch (error) {
      console.error('Error fetching files data:', error);
      throw error;
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
      console.log({ filename });
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading contract WASM:', error);
      alert('Failed to download contract WASM file. Please try again.');
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
      <div className="h-full bg-white dark:bg-black-600 text-sm text-gray-500 dark:text-neargray-10 divide-y dark:divide-black-200">
        <div className="flex flex-wrap p-4">
          <div className="w-full">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center">
                <FaCode className="mr-2 text-black-600 dark:text-neargray-10" />
                <span className="font-bold">
                  {verifierData
                    ? 'Contract Source Code'
                    : 'Base64 Encoded Contract Code'}
                </span>
              </div>

              {!verifierData && base64Code && (
                <button
                  onClick={downloadContractWasm}
                  className="flex items-center text-sm text-white my-1 text-center font-normal px-2 py-1 dark:bg-green-250 bg-green-500 rounded-md"
                >
                  <span className="mr-1">Download</span>
                </button>
              )}
            </div>

            {fileDataLoading ? (
              <Loader wrapperClassName="w-full md:w-full my-4 " />
            ) : (
              <>
                {fileDataError ? (
                  <ErrorMessage
                    icons={<FaInbox />}
                    message={fileDataError}
                    mutedText="Please try again later"
                  />
                ) : fileData && fileData.length > 0 ? (
                  fileData.map((file) => (
                    <CodeViewer
                      content={file.content}
                      key={file.name}
                      language="rust"
                      name={file.name}
                    />
                  ))
                ) : (
                  <div>
                    <textarea
                      className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 mt-3 resize-y"
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
                  </div>
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
