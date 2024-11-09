interface Props {
  icons: any | SVGElement;
  message: string;
  mutedText: any | string;
}
const ErrorMessage = ({ icons, message, mutedText }: Props) => {
  return (
    <div className="text-center py-24">
      <div className="mb-4 flex justify-center">
        <span className="inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-500 rounded-full p-4">
          {icons}
        </span>
      </div>

      <h3 className="font-bold text-lg text-black dark:text-neargray-10">
        {message}
      </h3>

      <p className="mb-0 py-1 font-bold break-words px-2">{mutedText}</p>
    </div>
  );
};
export default ErrorMessage;
