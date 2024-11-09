import { Tooltip } from '@reach/tooltip';
import Clipboard from 'clipboard';
import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import ErrorMessage from '@/components/common/ErrorMessage';
import CopyIcon from '@/components/Icons/CopyIcon';
import FaCode from '@/components/Icons/FaCode';
import FaExpand from '@/components/Icons/FaExpand';
import FaInbox from '@/components/Icons/FaInbox';
import FaMinimize from '@/components/Icons/FaMinimize';
import { verifierConfig } from '@/utils/app/config';
import { VerifierData } from '@/utils/types';

type VerifiedDataProps = {
  base64Code: string;
  selectedVerifier: string;
  verifierData: VerifierData;
};

type FileItem = {
  name?: string;
  type?: string;
};

const VerifiedData: React.FC<VerifiedDataProps> = ({
  base64Code,
  selectedVerifier,
  verifierData,
}) => {
  const [showFullCode, setShowFullCode] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [codeHeights, setCodeHeights] = useState<{ [key: string]: number }>({});
  const codeContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>(
    {},
  );
  const [fileData, setFileData] = useState<{ content: string; name: string }[]>(
    [],
  );
  const [fileDataLoading, setFileDataLoading] = useState(true);
  const [fileDataError, setFileDataError] = useState<null | string>(null);
  const [copiedTooltips, setCopiedTooltips] = useState<{
    [key: string]: boolean;
  }>({});
  const copyButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>(
    {},
  );

  const theme = Cookies?.get('theme') || 'light';

  useEffect(() => {
    const fetchCode = async () => {
      setFileDataError(null);
      try {
        setFileDataLoading(true);
        const verifier = verifierConfig.find(
          (config) => config.accountId === selectedVerifier,
        );

        if (!verifier) {
          throw new Error('Verifier configuration not found.');
        }

        const cid = verifierData?.cid;

        if (cid) {
          const structureUrl: string = verifier?.fileStructureApiUrl(cid) || '';

          const response = await fetch(structureUrl, {
            headers: { Accept: 'application/json' },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch structure data');
          }

          const data = await response.json();

          const files = data?.structure
            .filter((item: FileItem) => item.type === 'file')
            .map((file: FileItem) => file.name);

          if (!files || files.length === 0) {
            throw new Error('No files found in the structure data');
          }

          const fileContentsPromises = files.map(async (fileName: string) => {
            try {
              if (fileName) {
                const sourceCodeUrl: string =
                  verifier?.sourceCodeApiUrl(cid, fileName) || '';

                const res = await fetch(sourceCodeUrl);

                if (!res.ok) {
                  throw new Error(
                    `Failed to fetch file content for ${fileName}`,
                  );
                }

                const content = await res.text();
                return { content, name: fileName };
              } else throw new Error('File name not found');
            } catch (error) {
              console.error(error);
              return { content: null, name: fileName };
            }
          });

          const fileData = await Promise.all(fileContentsPromises);

          const successfulFiles = fileData.filter(
            (file) => file.content !== null,
          );

          if (successfulFiles.length === 0) {
            throw new Error(`Failed to fetch all files`);
          }

          setFileData(fileData);
        }
      } catch (error) {
        console.error('Error fetching contract source code:', error);
        setFileDataError('Failed to fetch contract source code');
      } finally {
        setFileDataLoading(false);
      }
    };

    if (verifierData) fetchCode();
    else {
      setFileDataError(null);
      setFileDataLoading(false);
    }
  }, [selectedVerifier, verifierData]);

  useEffect(() => {
    const handleFileViewerControls = () => {
      fileData.forEach((file) => {
        setCodeHeights((prev) => ({
          ...prev,
          [file.name]: 300,
        }));

        setShowFullCode((prev) => ({
          ...prev,

          [file.name]: false,
        }));

        setCopiedTooltips((prev) => ({
          ...prev,
          [file.name]: false,
        }));
      });

      Object.keys(copyButtonRefs.current).forEach((fileName) => {
        const button = copyButtonRefs.current[fileName];
        if (!button) return;

        const clipboard = new Clipboard(button, {
          text: () => {
            const file = fileData.find((file) => file.name === fileName);
            return file?.content || '';
          },
        });

        clipboard.on('success', () => {
          setCopiedTooltips((prev) => ({ ...prev, [fileName]: true }));
          setTimeout(
            () => setCopiedTooltips((prev) => ({ ...prev, [fileName]: false })),
            1000,
          );
        });

        return () => clipboard.destroy();
      });
    };
    if (!fileDataError && fileData) handleFileViewerControls();
  }, [fileData, fileDataError]);

  const handleToggleCodeView = (fileName: string) => {
    setShowFullCode((prev) => ({
      ...prev,

      [fileName]: !prev[fileName],
    }));

    setCodeHeights((prev) => ({
      ...prev,
      [fileName]: showFullCode[fileName]
        ? 300
        : codeContainerRefs.current[fileName]?.scrollHeight || 300,
    }));
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
            <div className="flex items-center">
              <FaCode className="mr-2 text-black-600 dark:text-neargray-10" />
              <span className="font-bold">
                {verifierData
                  ? 'Contract Source Code'
                  : 'Base64 Encoded Contract Code'}
              </span>
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
                  fileData.map(({ content, name }, index) => (
                    <div className="pb-4" key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">{name}</div>
                        <div className="flex items-center">
                          <Tooltip
                            className="absolute h-auto max-w-[6rem] sm:max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                            label="Copy code to clipboard"
                          >
                            <span className="relative">
                              {copiedTooltips[name] && (
                                <span className="absolute bg-black bg-opacity-90 z-30 -left-full -top-9 text-xs text-white break-normal px-3 py-2">
                                  Copied!
                                </span>
                              )}
                              <button
                                className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7 mr-2"
                                ref={(el) => {
                                  copyButtonRefs.current[name] = el;
                                }}
                                type="button"
                              >
                                <CopyIcon className="fill-current -z-50 text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
                              </button>
                            </span>
                          </Tooltip>
                          <Tooltip
                            className="absolute h-auto max-w-[6rem] sm:max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                            label={showFullCode[name] ? 'Minimize' : 'Maximize'}
                          >
                            <button
                              className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7"
                              onClick={() => handleToggleCodeView(name)}
                            >
                              {showFullCode[name] ? (
                                <FaMinimize className="fill-current -z-50 text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
                              ) : (
                                <FaExpand className="fill-current -z-50 text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
                              )}
                            </button>
                          </Tooltip>
                        </div>
                      </div>

                      <div
                        className={`transition-all duration-300 ease-in-out border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 overflow-y-auto p-0 `}
                        ref={(el) => (codeContainerRefs.current[name] = el)}
                        style={{
                          height: `${codeHeights[name] || 300}px`,
                        }}
                      >
                        {content ? (
                          <SyntaxHighlighter
                            customStyle={{
                              backgroundColor:
                                theme === 'dark'
                                  ? 'var(--color-black-200)'
                                  : 'var(--color-gray-100)',
                              borderColor:
                                theme === 'dark'
                                  ? 'var(--color-black-200)'
                                  : '',
                              margin: 0,
                              padding: 0,
                            }}
                            language={verifierData?.lang || 'rust'}
                            lineNumberStyle={{
                              backgroundColor: `${
                                theme === 'dark' ? '#030712' : '#d1d5db'
                              }`,
                              display: 'inline-block',
                              margin: '0 5px 0 0',
                              minWidth: '5em',
                              padding: '0 10px 0 0',
                              width: '5em',
                            }}
                            showLineNumbers={true}
                            style={theme === 'dark' ? oneDark : oneLight}
                            wrapLines={true}
                            wrapLongLines={true}
                          >
                            {content || 'No source code available'}
                          </SyntaxHighlighter>
                        ) : (
                          <ErrorMessage
                            icons={<FaInbox />}
                            message={'Failed to fetch the file content'}
                            mutedText="Please try again later"
                          />
                        )}
                      </div>
                    </div>
                  ))
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
