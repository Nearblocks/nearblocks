export const runtime = 'edge';

export default function About() {
  return (
    <>
      <h1 className="mb-4 pt-8 sm:text-2xl text-center text-2xl text-green-500 dark:text-green-250">
        About Nearblocks
      </h1>
      <div className="text-base text-neargray-600 dark:text-neargray-10 py-8  mx-10 text-center">
        NearBlocks is the leading Blockchain Explorer, Search, API and Analytics
        Platform for Near Protocol, a decentralized smart contracts platform.
        Built and launched in 2022, it is one of the earliest projects built
        around Near Protocol and its community with the mission of providing
        equitable access to blockchain data.
      </div>
    </>
  );
}
