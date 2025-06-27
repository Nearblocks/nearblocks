import TermsAndConditions from '@/components/app/TermsAndConditions';
import { cookies } from 'next/headers';

export default async function TermsAndCondition() {
  const theme = (await cookies()).get('theme')?.value || 'light';
  return <TermsAndConditions theme={theme} />;
}
