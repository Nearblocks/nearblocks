import type { IconProps } from '@/types/types';

export type CopyProps = {
  buttonClassName: string;
  className: string;
  text: string;
};

const Button = styled.button`
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
  border: none;
`;

const Copy = ({ buttonClassName, className, text }: CopyProps) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button className={buttonClassName} onClick={onCopy}>
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
    </Button>
  );
};

export default Copy;
