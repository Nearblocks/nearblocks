export const runtime = 'edge';

export default async function About() {
  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72 -mb-48"></div>
      <div className="py-16 bg-white dark:bg-black-600 soft-shadow container-xxl sm:mx-auto rounded-md my-10">
        <h1 className="mb-4 pt-8 sm:text-2xl text-center text-2xl text-green-500 dark:text-green-250">
          About Nearblocks
        </h1>
        <div className="text-base text-neargray-600 dark:text-neargray-10 py-8  mx-10 text-center">
          NearBlocks is the leading Blockchain Explorer, Search, API and
          Analytics Platform for Near Protocol, a decentralized smart contracts
          platform. Built and launched in 2022, it is one of the earliest
          projects built around Near Protocol and its community with the mission
          of providing equitable access to blockchain data.
        </div>
      </div>
    </>
  );
}
