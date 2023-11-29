interface props {
  src: string;
  alt: string;
  className: string;
  appUrl?: string;
}

const TokenImage = (props: props) => {
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
