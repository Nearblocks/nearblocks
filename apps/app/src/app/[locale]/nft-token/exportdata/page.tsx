import Export from '@/components/app/Export';
import { notFound } from 'next/navigation';

export default async function NftTokenExportData(props: {
  searchParams: Promise<{
    address?: string;
    type: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const { address } = searchParams;

  return (
    <div className="relative">
      {address ? <Export exportType={'nfttokentransactions'} id={address} /> : notFound()}
    </div>
  );
}
