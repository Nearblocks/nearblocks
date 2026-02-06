'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCollapseDiagonalLine,
  RiExpandDiagonalLine,
  RiFileCodeLine,
} from 'react-icons/ri';

import { CodeBlock } from '@/components/code-block';
import { Copy } from '@/components/copy';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/ui/skeleton';

type IpfsEntry = {
  Hash: string;
  Name: string;
  Size: number;
  Type: number;
};

type IpfsStructure = {
  cid: string;
  structure: IpfsEntry[];
};

type SourceFile = {
  hash: string;
  name: string;
  path: string;
  size: number;
};

type Props = {
  api: string;
  cid: string;
  gateway: string;
  path?: string;
};

const SKIP_DIRS = new Set([
  '.git',
  '.github',
  '.vscode',
  'node_modules',
  'target',
  '.cargo',
]);

const RUST_EXTENSIONS = ['.rs', '.toml', '.lock'];

const isRustRelated = (name: string): boolean => {
  return RUST_EXTENSIONS.some((ext) => name.endsWith(ext));
};

const getLanguage = (name: string): string => {
  if (name.endsWith('.rs')) return 'rust';
  if (name.endsWith('.toml') || name.endsWith('.lock')) return 'toml';
  return 'plain';
};

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
};

const toggleSet = (prev: Set<string>, key: string): Set<string> => {
  const next = new Set(prev);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
};

export const IpfsSourceViewer = ({ api, cid, gateway, path }: Props) => {
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [fullHeightFiles, setFullHeightFiles] = useState<Set<string>>(
    new Set(),
  );
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());

  const fetchStructure = useCallback(
    async (hash: string, parentPath = ''): Promise<SourceFile[]> => {
      const res = await fetch(`${api}?cid=${hash}`);
      if (!res.ok) throw new Error(`Failed to fetch structure for ${hash}`);
      const data: IpfsStructure = await res.json();

      const dirPromises: Promise<SourceFile[]>[] = [];
      const collected: SourceFile[] = [];

      for (const entry of data.structure) {
        const fullPath = parentPath
          ? `${parentPath}/${entry.Name}`
          : entry.Name;

        if (entry.Type === 1 && !SKIP_DIRS.has(entry.Name)) {
          dirPromises.push(fetchStructure(entry.Hash, fullPath));
        } else if (entry.Type === 2 && isRustRelated(entry.Name)) {
          collected.push({
            hash: entry.Hash,
            name: entry.Name,
            path: fullPath,
            size: entry.Size,
          });
        }
      }

      const subResults = await Promise.all(dirPromises);
      return [...collected, ...subResults.flat()];
    },
    [api],
  );

  useEffect(() => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    fetchStructure(cid)
      .then((result) => {
        const prefix = path ? `${path.replace(/\/+$/, '')}/` : '';
        const filtered = prefix
          ? result.filter((f) => f.path.startsWith(prefix))
          : result;
        filtered.sort((a, b) => a.path.localeCompare(b.path));
        setFiles(filtered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cid, fetchStructure, path]);

  const handleToggle = useCallback(
    async (file: SourceFile) => {
      const wasExpanded = expandedFiles.has(file.hash);
      setExpandedFiles((prev) => toggleSet(prev, file.hash));

      if (wasExpanded || fileContents[file.hash]) return;

      setLoadingFiles((prev) => new Set(prev).add(file.hash));
      try {
        const res = await fetch(`${gateway}/${file.hash}`);
        if (!res.ok) throw new Error('Failed to fetch file');
        const text = await res.text();

        setFileContents((prev) => ({ ...prev, [file.hash]: text }));
      } catch {
        setFileContents((prev) => ({
          ...prev,
          [file.hash]: '// Failed to load file content',
        }));
      } finally {
        setLoadingFiles((prev) => {
          const next = new Set(prev);
          next.delete(file.hash);
          return next;
        });
      }
    },
    [expandedFiles, fileContents, gateway],
  );

  if (loading) {
    return (
      <div className="border-border overflow-hidden rounded-lg border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="border-b px-3 py-2 last:border-b-0" key={i}>
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive py-4 text-sm">
        Failed to load source files: {error}
      </p>
    );
  }

  if (!files.length) {
    return (
      <p className="text-muted-foreground py-4 text-sm">
        No Rust source files found.
      </p>
    );
  }

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      {files.map((file) => {
        const isExpanded = expandedFiles.has(file.hash);
        const isLoading = loadingFiles.has(file.hash);
        const content = fileContents[file.hash];
        const isFullHeight = fullHeightFiles.has(file.hash);

        return (
          <div
            className="border-border border-b last:border-b-0"
            key={file.hash}
          >
            <button
              className={cn(
                'hover:bg-muted/50 flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                isExpanded && 'bg-muted/50',
              )}
              onClick={() => handleToggle(file)}
            >
              {isExpanded ? (
                <RiArrowDownSLine className="text-muted-foreground size-4 shrink-0" />
              ) : (
                <RiArrowRightSLine className="text-muted-foreground size-4 shrink-0" />
              )}
              <RiFileCodeLine className="text-muted-foreground size-4 shrink-0" />
              <span className="truncate font-mono text-xs">{file.path}</span>
              <span className="text-muted-foreground ml-auto shrink-0 text-xs">
                {formatSize(file.size)}
              </span>
            </button>
            {isExpanded && (
              <div className="border-border relative border-t">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="border-muted-foreground size-5 animate-spin rounded-full border-2 border-t-transparent" />
                  </div>
                ) : content !== undefined ? (
                  <>
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5">
                      <Copy className="text-muted-foreground" text={content} />
                      <button
                        className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
                        onClick={() =>
                          setFullHeightFiles((prev) =>
                            toggleSet(prev, file.hash),
                          )
                        }
                        title={isFullHeight ? 'Collapse' : 'Expand'}
                      >
                        {isFullHeight ? (
                          <RiCollapseDiagonalLine className="size-3.5" />
                        ) : (
                          <RiExpandDiagonalLine className="size-3.5" />
                        )}
                      </button>
                    </div>
                    <div
                      className={cn(
                        'scroll-overlay overflow-auto',
                        !isFullHeight && 'max-h-[500px]',
                      )}
                    >
                      <CodeBlock
                        code={content}
                        language={getLanguage(file.name)}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
