import type { IconProps } from '@/types/types';

export type ErrorProps = {
  text?: string;
  title: string;
};

const Error = ({ text, title }: ErrorProps) => {
  return (
    <div className="relative container mx-auto">
      <div className="flex flex-col items-center py-10 px-5">
        <Widget<IconProps>
          key="warning-icon"
          props={{ className: 'text-text-warning w-12 mb-2' }}
          src={`${config_account}/widget/lite.Icons.Warning`}
        />
        <h1 className="font-heading font-medium text-xl tracking-[0.1px]">
          {title}
        </h1>
        <p className="text-text-label text-sm mt-1">
          {text ?? 'Please try again or try changing the RPC endpoint'}
        </p>
      </div>
    </div>
  );
};

export default Error;
