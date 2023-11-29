/**
 * @param {boolean} fromHome - Indicates if the component is rendered from the home.
 */

interface Props {
  fromHome?: boolean;
}
export default function (props: Props) {
  interface Sponsored {
    title: string;
    description: string;
    btnText: string;
    url: string;
  }
  const [sponsored, setSponsored] = useState<Sponsored>({} as Sponsored);
  const sponsoredText = [
    {
      title: '1inch -',
      description:
        'Store your tokens safely. Go self-custodial with the 1inch Wallet -',
      btnText: 'Download now',
      url: 'https://1inch.network/Nearblocks_Textad',
    },
    {
      title: 'Stader Labs -',
      description:
        'Get 50%+ APY & Assurance of Fund Safety with NearX Multi-Layer Security | Now Integrated with Burrow | ',
      btnText: 'NearX - Live on Aurora & NEAR',
      url: 'https://near.staderlabs.com/lt/near?tab=Stake',
    },
  ];

  useEffect(
    () =>
      setSponsored(
        sponsoredText[Math.floor(Math.random() * sponsoredText.length)],
      ),
    [],
  );

  return sponsored ? (
    <div className="pt-3 text-sm flex">
      <p
        className={`pr-2  ${
          props.fromHome ? 'text-white' : 'text-black'
        }  font-thin`}
      >
        Sponsored:
        <span className="font-semibold ml-2">{sponsored.title}</span>{' '}
        <span className="font-thin">{sponsored.description} </span>
        <a
          href={sponsored.url}
          target="_blank"
          className="text-blue-600 font-bold"
          rel="noopener noreferrer nofollow"
        >
          {sponsored.btnText}
        </a>
      </p>
    </div>
  ) : null;
}
