import Head from 'next/head';

type MetaProps = {
  description: string;
  title: string;
};

const Meta = ({ description, title }: MetaProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta content={description} name="description" />
    </Head>
  );
};

export default Meta;
