/**
 * @interface Props
 * @param {string} [appUrl] - The URL of the application.
 */

interface Props {
  appUrl?: string;
}

const Earn = (props: Props) => {
  return (
    <a
      href="https://near.staderlabs.com/lt/near?tab=Stake"
      target="_blank"
      rel="noopener noreferrer nofollow"
    >
      <span className="flex items-center text-green-500 dark:text-green-250 text-sm mb-2">
        <img
          alt="Stader Labs"
          width={15}
          height={20}
          className="w-4 h-4 mr-3"
          src={`${props.appUrl}_next/image?url=%2Fsponsored%2Fstader.png&w=16&q=75`}
        />
        <h3 className="ml-2">Stader Labs</h3>
      </span>
      <p className="text-xs text-gray-500">
        High DeFi Yields ~21% on NearX with Stader | Multi-Layer Security | Zero
        Rewards Loss | $1 Mn Bug Bounty
      </p>
    </a>
  );
};

export default Earn;
