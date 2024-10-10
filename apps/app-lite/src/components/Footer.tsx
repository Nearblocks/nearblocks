import { useNetworkStore } from '@/stores/network';

import Github from './Icons/Github';

const Footer = () => {
  const network = useNetworkStore((state) => state.network);

  return (
    <div className="bg-bottom-right">
      <div className="bg-bottom-left">
        <div className="container mx-auto px-3 pb-16">
          <div className="flex justify-between border-t border-border-body">
            <div className="font-light text-xs text-text-body pb-1 pt-6 text-center">
              Powered by{' '}
              <a
                className="text-primary"
                href={`${
                  network === 'testnet'
                    ? 'https://testnet.nearblocks.io/'
                    : 'https://nearblocks.io'
                }`}
                target="_blank"
              >
                NearBlocks.io
              </a>
            </div>
            <a
              className="pb-1 pt-5"
              href="https://github.com/Nearblocks"
              rel="noreferrer nofollow noopener"
              target="_blank"
            >
              <Github className="w-4 text-text-body" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Footer;
