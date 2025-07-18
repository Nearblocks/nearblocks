export default async function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative container-xxl mx-auto px-5">
      <section>{children}</section>
    </div>
  );
}
