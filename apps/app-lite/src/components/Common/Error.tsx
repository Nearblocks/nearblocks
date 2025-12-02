import Warning from '@/components/Icons/Warning';

export type ErrorProps = {
  text?: string;
  title?: string;
};

const DefaultText = 'Please try again or try changing the RPC endpoint';

const Error = ({
  text = DefaultText,
  title = 'Error Fetching Data',
}: ErrorProps) => {
  return (
    <div className="relative container mx-auto">
      <div className="flex flex-col items-center py-10 px-5">
        <Warning className="text-text-warning w-12 mb-2" />
        <h1 className="font-heading font-medium text-xl text-center tracking-[0.1px]">
          {title}
        </h1>
        <p className="text-text-label text-sm text-center mt-1">
          {text || DefaultText}
        </p>
      </div>
    </div>
  );
};

export default Error;
