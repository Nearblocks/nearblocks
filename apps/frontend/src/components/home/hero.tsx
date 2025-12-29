import { SearchBar } from '@/components/search';

export const Hero = () => {
  return (
    <div className="text-white-950 h-57.5 bg-[url(/images/bg.png)] bg-cover">
      <div className="container mx-auto px-4 pt-10">
        <h1 className="text-headline-2xl">The Near blockchain explorer</h1>
        <SearchBar />
      </div>
    </div>
  );
};
