import QRCodeIcon from '@/includes/icons/QRCodeIcon';
import QrCode from '@/includes/Common/QrCode';
import CopyIcon from '@/includes/icons/CopyIcon';
import CloseCircle from '@/includes/icons/CloseCircle';

/**
 * @interface Props
 * @param {string} [id] - The account identifier passed as a string.
 */

interface Props {
  id: string;
  theme: string;
}

export default function (props: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const onCopyClick = () => {
    clipboard.writeText(props.id);
    setShowTooltip((t: boolean) => !t);
    setTimeout(() => {
      setShowTooltip((t: boolean) => !t);
    }, 5000);
  };
  return (
    <>
      <span className="inline-flex space-x-2 h-7">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={onCopyClick}
                className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7"
              >
                <CopyIcon className="fill-current -z-50 text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content
              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
              sideOffset={5}
              side="bottom"
            >
              {showTooltip ? 'Copied!' : 'Copy account ID to clipboard'}
              <Tooltip.Arrow className="fill-white" />
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button className="bg-green-500 dark:bg-black-200 items-center bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <QRCodeIcon className="fill-current text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                    sideOffset={8}
                    side="bottom"
                  >
                    Click to view QR Code
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </button>
          </Dialog.Trigger>
          <Dialog.Overlay className="bg-green-500 bg-opacity-10 data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content className="z-50 data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] overflow-clip bg-white dark:bg-black-600 p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] w-96 h-96 ">
            <Dialog.Title>
              <div className="flex items-center justify-between bg-gray-100 dark:bg-black-200 dark:text-neargray-10 px-3 py-4">
                <h4 className="flex items-center text-xs break-all">
                  {props.id}
                </h4>
                <Dialog.Close asChild className="text-gray-500 fill-current">
                  <button
                    className="text-gray-500 fill-current"
                    aria-label="Close"
                  >
                    <CloseCircle />
                  </button>
                </Dialog.Close>
              </div>
            </Dialog.Title>
            <div className="p-4">
              <QrCode
                value={props.id}
                width={160}
                height={160}
                theme={props.theme}
              />
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </span>
    </>
  );
}
