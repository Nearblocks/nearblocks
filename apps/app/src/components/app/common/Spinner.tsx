export function Spinner() {
  return (
    <div className="flex items-center justify-center bg-opacity-10 dark:bg-opacity-50">
      <div className="w-4 h-4 border-2 border-solid dark:border-neargreen-200 border-green border-b-transparent dark:border-b-current rounded-[50%] inline-block box-border animate-spin duration-1000 linear infinite"></div>
    </div>
  );
}
