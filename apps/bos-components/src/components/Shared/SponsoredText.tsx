/**
 * @interface Props
 * @param {boolean} [textColor] - Indicates the optional text color property for the component.
 */

interface Props {
  textColor?: boolean;
}

export default function (props: Props) {
  interface Sponsored {
    title: string;
    description: string;
    btnText: string;
    url: string;
  }

  const [sponsored, setSponsored] = useState<Sponsored>({} as Sponsored);

  useEffect(() => {
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
    setSponsored(
      sponsoredText[Math.floor(Math.random() * sponsoredText.length)],
    );
  }, [setSponsored]);

  return sponsored ? (
    <div className="pt-3 text-sm flex">
      <p
        className={`pr-2  ${
          props.textColor ? 'text-white' : 'text-black'
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
