import Head from 'next/head';

type Props = {
  description: string;
  image?: null | string;
  title: string;
};

export function MetaTags(props: Props) {
  return (
    <Head>
      <title>{props.title}</title>
      <meta content={props.description} name="description" />
      <meta content={props.title} property="og:title" />
    </Head>
  );
}
