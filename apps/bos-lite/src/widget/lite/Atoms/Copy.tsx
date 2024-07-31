import type { IconProps } from '@/types/types';

export type CopyProps = {
  buttonClassName: string;
  className: string;
  text: string;
};

const Copy = ({ buttonClassName, className, text }: CopyProps) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button className={buttonClassName} onClick={onCopy}>
      {copied ? (
        <Widget<IconProps>
          key="check-icon"
          props={{ className }}
          src={`${config_account}/widget/lite.Icons.Check`}
        />
      ) : (
        <Widget<IconProps>
          key="copy-icon"
          props={{ className }}
          src={`${config_account}/widget/lite.Icons.Copy`}
        />
      )}
    </button>
  );
};

export default Copy;
