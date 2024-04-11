interface IframeProps {
  className: string;
  srcDoc: string;
  message: string;
  onMessage: (event: MessageEvent) => void;
}
const Iframe = (props: IframeProps) => {
  return <>{<iframe {...props} />}</>;
};
export default Iframe;
