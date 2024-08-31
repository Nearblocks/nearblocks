export function Spinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10 dark:bg-opacity-50">
      <div className="w-12 h-12 border-4 border-solid border-black dark:border-neargray-10 border-b-transparent dark:border-b-current rounded-[50%] inline-block box-border animate-spin duration-1000 linear infinite"></div>
    </div>
  );
}
