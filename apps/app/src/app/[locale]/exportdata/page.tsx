import Export from '@/components/app/Export';

export default async function NftTokenExportData(props: {
  searchParams: Promise<{
    address?: string;
    type: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  const { address, type } = searchParams;

  return (
    <div className="relative">
      {address && type && <Export exportType={type} id={address} />}
    </div>
  );
}
