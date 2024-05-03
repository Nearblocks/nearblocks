interface PaginatorProps {
  apiUrl: string;
  count: number;
  limit: number;
  setUrl: (url: string) => void;
  cursor: string | undefined;
  isLoading?: boolean;
  ownerId: string;
}
const CursorPaginator = (props: PaginatorProps) => {
  const [disabled, setDisabled] = useState(true);
  const initialPage = 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const { formatWithCommas } = VM.require(
    `${props.ownerId}/widget/includes.Utils.formats`,
  );

  function constructURL(params: string | undefined) {
    let url = props.apiUrl;
    if (params) {
      const urlObj = new URL(url);
      urlObj.searchParams.append('cursor', '');
      urlObj.searchParams.set('cursor', params);
      return urlObj.toString() + '&';
    }
    return url;
  }

  const handleNextPage = () => {
    props.setUrl(constructURL(props.cursor));
    setCurrentPage((prev) => prev + 1);
    setDisabled(false);
  };
  const onFirst = () => {
    props.setUrl(props.apiUrl);
    setDisabled(true);
    setCurrentPage(initialPage);
  };

  return (
    <>
      <div className="bg-white dark:bg-black-600 px-2 py-3 flex items-center justify-between border-t dark:border-black-200 md:px-4 rounded-b-xl">
        <div className="flex-1 flex items-center justify-between">
          <div></div>
          <div
            className="relative z-0 inline-flex rounded-md"
            aria-label="Pagination"
          >
            <button
              type="button"
              disabled={disabled || props.isLoading}
              onClick={onFirst}
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2  text-xs font-medium rounded-md ${
                disabled || props.isLoading
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:bg-green-400 dark:hover:bg-green-250 hover:text-white dark:hover:text-black'
              } bg-gray-100 dark:bg-black-200 dark:text-green-250`}
            >
              First
            </button>
            <button
              type="button"
              disabled
              className="relative inline-flex items-center px-2 ml-1 md:px-3 py-2 text-xs font-medium text-gray-500  rounded-md  bg-gray-100 dark:bg-black-200 dark:text-neargray-10"
            >
              {`Page ${formatWithCommas(currentPage)}`}
            </button>
            <button
              type="button"
              disabled={props.isLoading || !props.cursor}
              onClick={handleNextPage}
              className={`relative inline-flex items-center ml-1 px-2 md:px-3 py-2 rounded-md font-medium text-xs ${
                props.isLoading || !props.cursor
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-400 dark:hover:bg-green-250'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default CursorPaginator;
