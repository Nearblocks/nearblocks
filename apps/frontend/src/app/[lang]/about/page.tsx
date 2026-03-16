import Image from 'next/image';

const AboutPage = () => {
  return (
    <main className="flex flex-1 flex-col py-10">
      <div className="bg-card container mx-auto flex flex-1 items-center justify-center rounded-lg px-4 py-10">
        <div className="text-center">
          <h1 className="text-headline-2xl mb-6">About Nearblocks</h1>
          <p className="text-muted-foreground mx-auto mb-10 max-w-3xl text-balance">
            NearBlocks is the leading Blockchain Explorer, Search, API and
            Analytics Platform for Near Protocol, a decentralized smart
            contracts platform. Built and launched in 2022, it is one of the
            earliest projects built around Near Protocol and its community with
            the mission of providing equitable access to blockchain data.
          </p>
          <Image
            alt="community"
            className="mx-auto"
            height={348}
            src="/images/world_link.png"
            width={618}
          />
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
