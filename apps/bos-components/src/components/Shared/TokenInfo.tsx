import TokenImage from '@/includes/icons/TokenImage';
import { MetaInfo, TokenInfoProps } from '@/includes/types';

export default function (props: TokenInfoProps) {
  const { network, contract, amount, decimals, ownerId } = props;

  const { shortenToken, shortenTokenSymbol, localFormat } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const { getConfig } = VM.require(`${ownerId}/widget/includes.Utils.libs`);

  const { decodeArgs, tokenAmount } = VM.require(
    `${ownerId}/widget/includes.Utils.near`,
  );
  const [meta, setMeta] = useState<MetaInfo>({} as MetaInfo);

  const config = getConfig && getConfig(network);

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props?.wrapperClassName}`}
      ></div>
    );
  };

  useEffect(() => {
    function fetchMetadata(contract: string) {
      if (contract) {
        asyncFetch(`${config?.rpcUrl}`, {
          method: 'POST',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'dontcare',
            method: 'query',
            params: {
              request_type: 'call_function',
              finality: 'final',
              account_id: contract,
              method_name: 'ft_metadata',
              args_base64: '',
            },
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(
            (data: {
              body: {
                result: { result: string[] };
              };
            }) => {
              const resp = data?.body?.result;
              setMeta(decodeArgs(resp.result));
            },
          )
          .catch(() => {});
      }
    }

    fetchMetadata(contract);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, config?.rpcUrl]);

  return !meta?.name ? (
    <Loader wrapperClassName="flex w-full max-w-xl" />
  ) : (
    <>
      <span className="font-normal px-1">
        {amount
          ? localFormat(tokenAmount(amount, meta?.decimals || decimals, true))
          : amount ?? ''}
      </span>
      <span className="flex items-center">
        <TokenImage
          src={meta?.icon}
          alt={meta?.name}
          appUrl={config?.appUrl}
          className="w-4 h-4 mx-1"
        />
        {shortenToken(meta?.name)}
        <span>&nbsp;({shortenTokenSymbol(meta?.symbol)})</span>
      </span>
    </>
  );
}
