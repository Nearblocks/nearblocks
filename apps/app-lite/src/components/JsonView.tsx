import { ReactNode } from 'react';

type JsonViewProps = {
  children: ReactNode;
  className?: string;
};

const JsonView = ({ children, className }: JsonViewProps) => {
  return (
    <pre
      className={`bg-bg-code text-sm whitespace-pre overflow-y-auto p-3 rounded ${className}`}
    >
      {children}
    </pre>
  );
};

export default JsonView;
