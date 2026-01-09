import { renderSVG } from 'uqr';

type Props = {
  text: string;
};

export const QrCode = ({ text }: Props) => {
  return <div dangerouslySetInnerHTML={{ __html: renderSVG(text) }} />;
};
