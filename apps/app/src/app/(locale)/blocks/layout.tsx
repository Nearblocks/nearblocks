// import { unstable_setRequestLocale } from 'next-intl/server';

export default function BlockLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  // unstable_setRequestLocale(locale);

  return children;
}
