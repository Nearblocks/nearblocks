/**
 * @interface Props
 * @param {string} [src] - The URL string pointing to the image source.
 * @param {string} [alt] - The alternate text description for the image.
 * @param {string} [className] - The CSS class name(s) for styling purposes.
 * @param {string} [appUrl] - The URL of the application.
 */

interface Props {
  src: string;
  alt?: string;
  className?: string;
  appUrl?: string;
  onLoad?: () => void;
}

const TokenImage = ({ appUrl, src, alt, ...rest }: Props) => {
  const placeholder = `${appUrl}images/tokenplaceholder.svg`;
  const onError = (e: any) => {
    e.target.onError = null;
    e.target.src = placeholder;
  };

  return <img src={src || placeholder} alt={alt} {...rest} onError={onError} />;
};

export default TokenImage;
