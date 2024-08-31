import { unstable_setRequestLocale } from 'next-intl/server';

export default function AddressLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: any;
}) {
  unstable_setRequestLocale(locale);

  return children;
}
