import { shortenToken, shortenTokenSymbol } from '@/includes/formats';
import TokenImage from '@/includes/icons/TokenImage';
import { getConfig } from '@/includes/libs';
import { decodeArgs, tokenAmount } from '@/includes/near';
import { MetaInfo, TokenInfoProps } from '@/includes/types';

export default function (props: TokenInfoProps) {
  const { network, contract, amount, decimals } = props;
  const [meta, setMeta] = useState<MetaInfo>({} as MetaInfo);
  const config = getConfig(network);
  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props?.wrapperClassName}`}
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
  }, [contract, config?.rpcUrl]);

  return !meta?.name ? (
    <Loader wrapperClassName="flex w-full max-w-xl" />
  ) : (
    <>
      <span className="font-normal px-1">
        {amount
          ? tokenAmount(amount, meta?.decimals || decimals, true)
          : amount ?? ''}
      </span>
      <span className="flex items-center">
        <TokenImage
          src={meta?.icon}
          alt={meta?.name}
          className="w-4 h-4 mx-1"
        />
        {shortenToken(meta?.name)}
        <span>&nbsp;({shortenTokenSymbol(meta?.symbol)})</span>
      </span>
    </>
  );
}
