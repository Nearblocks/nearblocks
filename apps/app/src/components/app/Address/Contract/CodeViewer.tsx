import Clipboard from 'clipboard';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/cjs/styles/prism';

import ErrorMessage from '../../common/ErrorMessage';
import Tooltip from '../../common/Tooltip';
import CopyIcon from '../../Icons/CopyIcon';
import FaExpand from '../../Icons/FaExpand';
import FaInbox from '../../Icons/FaInbox';
import FaMinimize from '../../Icons/FaMinimize';

type CodeViewerProps = {
  content: string;
  language: string;
  name: string;
};

const CodeViewer: React.FC<CodeViewerProps> = ({ content, language, name }) => {
  const [showFullCode, setShowFullCode] = useState(false);
  const [codeHeight, setCodeHeight] = useState(300);
  const [copied, setCopied] = useState(false);
  const codeContainerRef = useRef<HTMLDivElement | null>(null);
  const copyButtonRef = useRef<HTMLButtonElement | null>(null);

  const { theme } = useTheme();

  useEffect(() => {
    if (copyButtonRef.current) {
      const clipboard = new Clipboard(copyButtonRef.current, {
        text: () => content,
      });

      clipboard.on('success', () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      });

      return () => clipboard.destroy();
    }

    return undefined;
  }, [content]);

  const toggleCodeView = () => {
    setShowFullCode((prev) => {
      const isExpanded = !prev;
      setTimeout(() => {
        setCodeHeight(
          isExpanded ? codeContainerRef.current?.scrollHeight || 300 : 300,
        );
      }, 100);
      return isExpanded;
    });
  };

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center">{name}</span>
        <div className="flex items-center">
          <Tooltip
            className={'left-1/2 max-w-[200px] w-36'}
            position="top"
            tooltip="Copy code to clipboard"
          >
            <span className="relative">
              {copied && (
                <span className="absolute bg-black bg-opacity-90 z-30 -left-full -top-9 text-xs text-white break-normal px-3 py-2">
                  Copied!
                </span>
              )}
              <button
                className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1 w-6 h-6 mr-1.5"
                ref={copyButtonRef}
              >
                <CopyIcon className="fill-current -z-50 text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
              </button>
            </span>
          </Tooltip>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={showFullCode ? 'Minimize' : 'Maximize'}
          >
            <button
              className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1 w-6 h-6"
              onClick={toggleCodeView}
            >
              {showFullCode ? (
                <FaMinimize className="fill-current -z-50 text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
              ) : (
                <FaExpand className="fill-current -z-50 text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
      <div
        className="transition-all duration-300 ease-in-out border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 overflow-y-auto p-0"
        ref={codeContainerRef}
        style={{ height: `${codeHeight}px` }}
      >
        {content ? (
          <SyntaxHighlighter
            customStyle={{
              backgroundColor:
                theme === 'dark'
                  ? 'var(--color-black-200)'
                  : 'var(--color-gray-100)',
              borderColor: theme === 'dark' ? 'var(--color-black-200)' : '',
              margin: 0,
              padding: 0,
            }}
            language={language || 'rust'}
            lineNumberStyle={{
              backgroundColor: `${theme === 'dark' ? '#030712' : '#d1d5db'}`,
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
            {content}
          </SyntaxHighlighter>
        ) : (
          <ErrorMessage
            icons={<FaInbox />}
            message="Failed to fetch the file content"
            mutedText="Please try again later"
          />
        )}
      </div>
    </div>
  );
};

export default CodeViewer;
