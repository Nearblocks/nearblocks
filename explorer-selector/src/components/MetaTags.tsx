import Head from "next/head";

type Props = {
  title: string;
  description: string;
  image?: string | null;
};

export function MetaTags(props: Props) {
  return (
    <Head>
      <title>{props.title}</title>
      <meta name="description" content={props.description} />
      <meta property="og:title" content={props.title} />
    </Head>
  );
}
