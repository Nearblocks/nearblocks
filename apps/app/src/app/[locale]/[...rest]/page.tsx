export const runtime = 'edge';

import { notFound } from 'next/navigation';

export default function CatchAllPage() {
  notFound();
}
