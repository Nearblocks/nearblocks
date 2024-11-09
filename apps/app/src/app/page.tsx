export const runtime = 'edge';

import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en');
}
