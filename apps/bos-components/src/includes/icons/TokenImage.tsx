/**
 * @interface Props
 * @param {string} [src] - The URL string pointing to the image source.
 * @param {string} [alt] - The alternate text description for the image.
 * @param {string} [className] - The CSS class name(s) for styling purposes.
 * @param {string} [appUrl] - The URL of the application.
 */

interface Props {
  src: string;
  alt: string;
  className: string;
  appUrl?: string;
}

const TokenImage = (props: Props) => {
  const placeholder = `${props.appUrl}images/tokenplaceholder.svg`;

  return (
    <img
      src={props.src || placeholder}
      alt={props.alt}
      className={props.className}
    />
  );
};

export default TokenImage;
