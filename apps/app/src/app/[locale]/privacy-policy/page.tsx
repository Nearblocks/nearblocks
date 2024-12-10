import { cookies } from 'next/headers';

import { Policy } from '@/components/app/Policy';

export default async function PrivacyPolicy() {
  const theme = (await cookies()).get('theme')?.value || 'light';
  return <Policy theme={theme} />;
}
