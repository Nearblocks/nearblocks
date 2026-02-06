'use client';

import {
  type ChangeEvent,
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

type Props = {
  'aria-invalid'?: boolean;
  className?: string;
  name?: string;
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  value?: string;
};

const highlightJson = (code: string): string => {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const tokenRegex =
    /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g;

  return escaped.replace(tokenRegex, (match, str, colon, keyword, num) => {
    if (str !== undefined) {
      if (colon !== undefined) {
        return `<span class="dark:text-[#8BE9FD] text-[#036A96]">${str}</span>${colon}`;
      } else {
        return `<span class="text-[#846E15] dark:text-[#F1FA8C]">${str}</span>`;
      }
    }
    if (keyword !== undefined) {
      if (keyword === 'null') {
        return `<span class="text-[#CB3A2A] dark:text-[#FF5555]">${keyword}</span>`;
      }
      return `<span class="dark:text-[#BD93F9] text-[#644AC9]">${keyword}</span>`;
    }
    if (num !== undefined) {
      return `<span class="text-[#A3144D] dark:text-[#FF79C6]">${num}</span>`;
    }
    return match;
  });
};

const highlight = (code: string): string => {
  return highlightJson(code);
};

export const JsonEditor = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      'aria-invalid': ariaInvalid,
      className,
      name,
      onBlur,
      onChange,
      placeholder = 'Enter code...',
      readOnly = false,
      value = '',
    },
    ref,
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const [code, setCode] = useState(value);

    useImperativeHandle(ref, () => textareaRef.current!);

    useEffect(() => {
      setCode(value);
    }, [value]);

    const syncScroll = useCallback(() => {
      if (textareaRef.current && preRef.current) {
        preRef.current.scrollTop = textareaRef.current.scrollTop;
        preRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
    }, []);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setCode(newValue);
        onChange?.(newValue);
        syncScroll();
      },
      [onChange, syncScroll],
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const textarea = textareaRef.current;
          if (!textarea) return;

          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newValue =
            code.substring(0, start) + '  ' + code.substring(end);

          setCode(newValue);
          onChange?.(newValue);

          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
          });
        }
      },
      [code, onChange],
    );

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLTextAreaElement>) => {
        if (code.trim()) {
          try {
            const parsed = JSON.parse(code);
            const formatted = JSON.stringify(parsed, null, 2);
            if (formatted !== code) {
              setCode(formatted);
              onChange?.(formatted);
            }
          } catch {
            // Invalid JSON, leave as-is for validation to catch
          }
        }
        onBlur?.(e);
      },
      [code, onChange, onBlur],
    );

    const highlightedCode = highlight(code);
    const displayCode = code.endsWith('\n')
      ? highlightedCode + ' '
      : highlightedCode;

    return (
      <div
        className={cn(
          'border-border grid overflow-hidden rounded-lg border text-sm',
          ariaInvalid && 'border-destructive',
          className,
        )}
      >
        <pre
          aria-hidden="true"
          className="scroll-overlay pointer-events-none col-start-1 row-start-1 m-0 max-h-[220px] overflow-auto px-3 py-2 font-mono text-sm leading-relaxed wrap-break-word whitespace-pre-wrap [&>code]:bg-transparent!"
          ref={preRef}
        >
          <code dangerouslySetInnerHTML={{ __html: displayCode || '&nbsp;' }} />
        </pre>
        <textarea
          aria-invalid={ariaInvalid}
          className="scroll-overlay caret-foreground col-start-1 row-start-1 m-0 max-h-[220px] min-h-[100px] w-full resize-none overflow-auto bg-transparent px-3 py-2 font-mono text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-transparent outline-none"
          name={name}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={textareaRef}
          spellCheck={false}
          value={code}
        />
      </div>
    );
  },
);

JsonEditor.displayName = 'JsonEditor';
