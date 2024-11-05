import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Clipboard from 'clipboard';
import FaExpand from '@/components/Icons/FaExpand';
import FaMinimize from '@/components/Icons/FaMinimize';
import FaCode from '@/components/Icons/FaCode';
import { Tooltip } from '@reach/tooltip';
import CopyIcon from '@/components/Icons/CopyIcon';
import { VerifierData } from '@/utils/types';
import ErrorMessage from '@/components/common/ErrorMessage';
import FaInbox from '@/components/Icons/FaInbox';
import { verifierConfig } from '@/utils/app/config';
import Cookies from 'js-cookie';

type VerifiedDataProps = {
  verifierData: VerifierData;
  selectedVerifier: string;
  base64Code: string;
};

type FileItem = {
  type?: string;
  name?: string;
};

const VerifiedData: React.FC<VerifiedDataProps> = ({
  verifierData,
  selectedVerifier,
  base64Code,
}) => {
  const [showFullCode, setShowFullCode] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [codeHeights, setCodeHeights] = useState<{ [key: string]: number }>({});
  const codeContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>(
    {},
  );
  const [fileData, setFileData] = useState<{ name: string; content: string }[]>(
    [],
  );
  const [fileDataLoading, setFileDataLoading] = useState(true);
  const [fileDataError, setFileDataError] = useState<string | null>(null);
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
                return { name: fileName, content };
              } else throw new Error('File name not found');
            } catch (error) {
              console.error(error);
              return { name: fileName, content: null };
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
                  fileData.map(({ name, content }, index) => (
                    <div key={index} className="pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">{name}</div>
                        <div className="flex items-center">
                          <Tooltip
                            label="Copy code to clipboard"
                            className="absolute h-auto max-w-[6rem] sm:max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                          >
                            <span className="relative">
                              {copiedTooltips[name] && (
                                <span className="absolute bg-black bg-opacity-90 z-30 -left-full -top-9 text-xs text-white break-normal px-3 py-2">
                                  Copied!
                                </span>
                              )}
                              <button
                                ref={(el) => {
                                  copyButtonRefs.current[name] = el;
                                }}
                                type="button"
                                className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7 mr-2"
                              >
                                <CopyIcon className="fill-current -z-50 text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
                              </button>
                            </span>
                          </Tooltip>
                          <Tooltip
                            label={showFullCode[name] ? 'Minimize' : 'Maximize'}
                            className="absolute h-auto max-w-[6rem] sm:max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                          >
                            <button
                              onClick={() => handleToggleCodeView(name)}
                              className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7"
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
                        ref={(el) => (codeContainerRefs.current[name] = el)}
                        style={{
                          height: `${codeHeights[name] || 300}px`,
                        }}
                        className={`transition-all duration-300 ease-in-out border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 overflow-y-auto p-0 `}
                      >
                        {content ? (
                          <SyntaxHighlighter
                            language={verifierData?.lang || 'rust'}
                            style={theme === 'dark' ? oneDark : oneLight}
                            showLineNumbers={true}
                            lineNumberStyle={{
                              backgroundColor: `${
                                theme === 'dark' ? '#030712' : '#d1d5db'
                              }`,
                              padding: '0 10px 0 0',
                              width: '5em',
                              minWidth: '5em',
                              display: 'inline-block',
                              margin: '0 5px 0 0',
                            }}
                            wrapLines={true}
                            wrapLongLines={true}
                            customStyle={{
                              backgroundColor:
                                theme === 'dark'
                                  ? 'var(--color-black-200)'
                                  : 'var(--color-gray-100)',
                              borderColor:
                                theme === 'dark'
                                  ? 'var(--color-black-200)'
                                  : '',
                              padding: 0,
                              margin: 0,
                            }}
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
                    readOnly
                    rows={4}
                    value={base64Code}
                    className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200  p-3 mt-3 resize-y"
                    style={{
                      height: '300px',
                      overflowX: 'hidden',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                    }}
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
