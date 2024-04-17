interface Props {
  id?: string;
  content: () => React.JSX.Element;
}

const ToastMessage = (props: Props) => {
  const [open, setOpen] = useState(true);
  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root
        className="flex gap-4 p-4 max-w-sm w-full items-center justify-between bg-white dark:bg-black-200 rounded-lg shadow drop-shadow-md z-50 outline-none"
        open={open}
        onOpenChange={setOpen}
      >
        {props.content()}
        <Toast.Action className="" asChild altText="Goto schedule to undo">
          <button className="inline-flex h-fit w-fit items-center justify-center rounded-md font-medium text-red-500 focus:ring-red-500 focus:ring-offset-red-200 focus:ring-2 focus:outline-none focus:ring-offset-2 transition ease-in-out duration-150 text-xs lg:text-sm">
            x
          </button>
        </Toast.Action>
      </Toast.Root>

      <Toast.Viewport className="fixed top-0 right-0 gap-4 p-4 max-w-sm w-full rounded-lg z-50" />
    </Toast.Provider>
  );
};
export default ToastMessage;
