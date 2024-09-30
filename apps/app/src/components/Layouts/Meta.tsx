interface MetaProps {
  title: string;
  description: string;
  thumbnail: string;
}

const Meta = ({ title, description, thumbnail }: MetaProps) => {
  return (
    <>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={thumbnail} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={thumbnail} />
    </>
  );
};

export default Meta;
