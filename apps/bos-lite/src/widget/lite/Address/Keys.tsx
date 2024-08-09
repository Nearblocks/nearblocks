import type { RpcResultAccessKey } from 'nb-near';

import type { CopyProps } from '@/Atoms/Copy';
import type { TooltipProps } from '@/Atoms/Tooltip';
import type { ConvertorModule } from '@/libs/convertor';
import type { FetcherModule } from '@/libs/fetcher';
import type { FormatterModule } from '@/libs/formatter';
import type { UtilsModule } from '@/libs/utils';
import type { Keys } from '@/types/types';

export type KeysProps = {
  id: string;
  rpcUrl: string;
};

let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);
let AddressKeysSkeleton = window?.AddressKeysSkeleton || (() => <></>);
const Container = styled.div`
  position: relative;
  overflow: auto;
  .td-border {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    span {
      display: block;
      width: 100%;
      border-bottom-width: 1px;
      border-bottom-color: rgb(var(--color-border-body));
    }
  }
  .public-key-skeleton {
    height: 1.25rem;
    width: 190px;
  }
  .common-skeleton {
    height: 1.25rem;
    width: 64px;
  }
  .contract-skeleton {
    height: 1.25rem;
    width: 100px;
  }
  .method-skeleton {
    height: 1.25rem;
    width: 160px;
  }
  .tooltip-mr-1 {
    margin-right: 0.25rem;
  }
  .loading {
    display: block;
    width: 1rem;
    height: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .copy-button {
    height: 1rem;
    vertical-align: text-bottom;
  }
  .copy-class {
    width: 1rem;
  }
`;
const Table = styled.table`
  table-layout: auto;
  border-collapse: collapse;
  width: 100%;
`;
const Tr = styled.tr<{ bgcolor: string }>`
  &:hover: {
    background-color: ${(props: any) => (props.bgcolor ? props.bgcolor : '')};
  }
`;
const Th = styled.th<{
  pbottom?: string;
  pleft?: string;
  pright?: string;
  ptop?: string;
  width?: string;
}>`
  font-weight: 400;
  font-size: 0.75rem;
  line-height: 1rem;
  font-size: 0.75rem;
  line-height: 1rem;
  color: rgb(var(--color-text-label));
  text-transform: uppercase;
  text-align: left;
  width: ${(props: any) => (props.width ? props.width : '')};
  padding-left: ${(props: any) => (props.pleft ? props.pleft : '')};
  padding-right: ${(props: any) => (props.pright ? props.pright : '')};
  padding-top: ${(props: any) => (props.ptop ? props.ptop : '')};
  padding-bottom: ${(props: any) => (props.pbottom ? props.pbottom : '')};
`;
const Td = styled.td<{
  color?: string;
  fsize?: string;
  fweight?: string;
  height?: string;
  lheight?: string;
  pbottom?: string;
  pleft?: string;
  pright?: string;
  ptop?: string;
}>`
  font-weight: ${(props: any) => (props.fweight ? props.fweight : '')};
  font-size: ${(props: any) => (props.fsize ? props.fsize : '')};
  line-height: ${(props: any) => (props.lheight ? props.lheight : '')};
  color: ${(props: any) => (props.color ? props.color : '')};
  height: ${(props: any) => (props.height ? props.height : '')};
  padding-left: ${(props: any) => (props.pleft ? props.pleft : '')};
  padding-right: ${(props: any) => (props.pright ? props.pright : '')};
  padding-top: ${(props: any) => (props.ptop ? props.ptop : '')};
  padding-bottom: ${(props: any) => (props.pbottom ? props.pbottom : '')};
  .flex-span {
    display: flex;
  }
  .access-span {
    background-color: rgb(var(--color-bg-function));
    --tw-text-opacity: 1;
    color: rgb(0 0 0 / var(--tw-text-opacity));
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    border-radius: 0.25rem;
  }
  .method-span-loader {
    display: block;
    width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
const Pagination = styled.div`
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top-width: 1px;
    border-top-color: rgb(var(--color-border-body));
  }
  .page {
    font-weight: 400;
    font-size: 0.75rem;
    line-height: 1rem;
    color: rgb(var(--color-text-label));
    text-transform: uppercase;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    margin-left: 1rem;
    margin-right: 1rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
`;
const Button = styled.button<{
  color?: string;
  fsize?: string;
  fweight?: string;
  height?: string;
  lheight?: string;
  mbottom?: string;
  mleft?: string;
  mright?: string;
  mtop?: string;
  pbottom?: string;
  pleft?: string;
  pright?: string;
  ptop?: string;
}>`
  font-weight: ${(props: any) => (props.fweight ? props.fweight : '')};
  font-size: ${(props: any) => (props.fsize ? props.fsize : '')};
  line-height: ${(props: any) => (props.lheight ? props.lheight : '')};
  color: ${(props: any) => (props.color ? props.color : '')};
  text-transform: uppercase;
  padding-left: ${(props: any) => (props.pleft ? props.pleft : '')};
  padding-right: ${(props: any) => (props.pright ? props.pright : '')};
  padding-top: ${(props: any) => (props.ptop ? props.ptop : '')};
  padding-bottom: ${(props: any) => (props.pbottom ? props.pbottom : '')};
  margin-left: ${(props: any) => (props.mleft ? props.mleft : '')};
  margin-right: ${(props: any) => (props.mright ? props.mright : '')};
  margin-top: ${(props: any) => (props.mtop ? props.mtop : '')};
  margin-bottom: ${(props: any) => (props.mbottom ? props.mbottom : '')};
  border-radius: 0.25rem;
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
  margin: 0;
  border-width: 1px;
  border-color: rgb(var(--color-border-body));
`;

const PrevButton = styled(Button)`
  &:hover {
    -webkit-appearance: button;
    background-color: transparent;
    background-image: none;
    color: rgb(var(--color-primary));
    border-color: rgb(var(--color-primary));
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: rgb(var(--color-text-label));
    border-color: rgb(var(--color-border-body));
  }
`;
const NextButton = styled(Button)`
  &:hover {
    -webkit-appearance: button;
    background-color: transparent;
    background-image: none;
    color: rgb(var(--color-primary));
    border-color: rgb(var(--color-primary));
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: rgb(var(--color-text-label));
    border-color: rgb(var(--color-border-body));
  }
`;

const LIMIT = 25;

const Keys = ({ id, rpcUrl }: KeysProps) => {
  let { rpcFetch } = VM.require<FetcherModule>(
    `${config_account}/widget/lite.libs.fetcher`,
  );
  let { yoctoToNear } = VM.require<ConvertorModule>(
    `${config_account}/widget/lite.libs.convertor`,
  );
  let { formatNumber } = VM.require<FormatterModule>(
    `${config_account}/widget/lite.libs.formatter`,
  );
  let { shortenString } = VM.require<UtilsModule>(
    `${config_account}/widget/lite.libs.utils`,
  );

  if (!rpcFetch || !yoctoToNear || !formatNumber || !shortenString)
    return <AddressKeysSkeleton />;

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<Keys[]>([]);

  const [page, setPage] = useState(1);

  const pages = Math.ceil(keys.length / LIMIT);
  const start = (page - 1) * LIMIT;
  const end = start + LIMIT;
  const items = keys?.slice(start, end);

  useEffect(() => {
    if (rpcFetch && rpcUrl && id) {
      setLoading(true);

      rpcFetch<RpcResultAccessKey>(rpcUrl, 'query', {
        account_id: id,
        finality: 'final',
        request_type: 'view_access_key_list',
      })
        .then((response) => {
          const keys = response.keys.map((key) => {
            const publicKey = key.public_key;
            let access = 'FULL';
            let contract = '';
            let methods = '';
            let allowance = '';

            if (key.access_key.permission !== 'FullAccess') {
              const keyView = key.access_key.permission.FunctionCall;
              access = 'LIMITED';
              contract = keyView.receiver_id;
              methods = keyView.method_names?.length
                ? keyView.method_names.join(', ')
                : 'Any';
              allowance = keyView.allowance;
            }

            return {
              access,
              allowance,
              contract,
              methods,
              publicKey,
            };
          });

          if (keys.length) {
            setKeys(keys);
            setError(null);
          }
        })
        .catch(setError)
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, rpcUrl]);

  const onPrev = () => {
    setPage((prevPage: number) => Math.max(prevPage - 1, 1));
  };

  const onNext = () => {
    setPage((prevPage: number) => Math.min(prevPage + 1, pages));
  };

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <Th
              pbottom="1rem"
              pleft="1.5rem"
              pright="1rem"
              ptop="1rem"
              width="300px"
            >
              Public Key
            </Th>
            <Th
              pbottom="1rem"
              pleft="1rem"
              pright="1rem"
              ptop="1rem"
              width="84px"
            >
              Access
            </Th>
            <Th
              pbottom="1rem"
              pleft="1rem"
              pright="1rem"
              ptop="1rem"
              width="160px"
            >
              Contract
            </Th>
            <Th
              pbottom="1rem"
              pleft="1rem"
              pright="1rem"
              ptop="1rem"
              width="240px"
            >
              Methods
            </Th>
            <Th
              pbottom="1rem"
              pleft="1rem"
              pright="1.5rem"
              ptop="1rem"
              width="112px"
            >
              Allowance
            </Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="td-border" colSpan={5}>
              <span />
            </td>
          </tr>
          {loading ? (
            [...Array(LIMIT).keys()].map((key) => (
              <tr key={key}>
                <Td
                  height="46px"
                  pbottom="1rem"
                  pleft="1.5rem"
                  pright="1rem"
                  ptop="1rem"
                >
                  <span className="flex-span">
                    <Skeleton className="public-key-skeleton" loading>
                      &nbsp;
                    </Skeleton>
                  </span>
                </Td>
                <Td
                  className="h-[46px] px-4 py-4"
                  height="46px"
                  pbottom="1rem"
                  pleft="1rem"
                  pright="1rem"
                  ptop="1rem"
                >
                  <span className="flex-span">
                    <Skeleton className="common-skeleton" loading>
                      &nbsp;
                    </Skeleton>
                  </span>
                </Td>
                <Td
                  height="46px"
                  pbottom="1rem"
                  pleft="1rem"
                  pright="1rem"
                  ptop="1rem"
                >
                  <span className="flex-span">
                    <Skeleton className="contract-skeleton" loading>
                      &nbsp;
                    </Skeleton>
                  </span>
                </Td>
                <Td
                  height="46px"
                  pbottom="1rem"
                  pleft="1rem"
                  pright="1rem"
                  ptop="1rem"
                >
                  <span className="flex-span">
                    <Skeleton className="method-skeleton" loading>
                      &nbsp;
                    </Skeleton>
                  </span>
                </Td>
                <Td
                  height="46px"
                  pbottom="1rem"
                  pleft="1rem"
                  pright="1.5rem"
                  ptop="1rem"
                >
                  <span className="flex-span">
                    <Skeleton className="common-skeleton" loading>
                      &nbsp;
                    </Skeleton>
                  </span>
                </Td>
              </tr>
            ))
          ) : items?.length ? (
            items?.map((key) => (
              <Tr bgcolor="rgb(var(--color-bg-body))" key={key.publicKey}>
                <Td
                  fsize="0.875rem"
                  lheight="1.25rem"
                  pbottom="1rem"
                  pleft="1.5rem"
                  pright="1rem"
                  ptop="1rem"
                >
                  <Widget<TooltipProps>
                    key="tooltip"
                    loading={shortenString(key.publicKey, 15)}
                    props={{
                      children: shortenString(key.publicKey, 15),
                      tooltip: (
                        <span>
                          <span className="tooltip-mr-1">{key.publicKey}</span>
                          <Widget<CopyProps>
                            key="copy"
                            loading={<span className="loading" />}
                            props={{
                              buttonClassName: 'copy-button',
                              className: 'copy-class',
                              text: key.publicKey,
                            }}
                            src={`${config_account}/widget/lite.Atoms.Copy`}
                          />
                        </span>
                      ),
                    }}
                    src={`${config_account}/widget/lite.Atoms.Tooltip`}
                  />
                </Td>
                <Td
                  fsize="0.75rem"
                  lheight="1rem"
                  pbottom="1rem"
                  pleft="1rem"
                  pright="1rem"
                  ptop="1rem"
                >
                  <span className="access-span">{key.access}</span>
                </Td>
                <Td
                  fsize="0.875rem"
                  fweight="500"
                  lheight="1.25rem"
                  pbottom="1rem"
                  pleft="1rem"
                  pright="1rem"
                  ptop="1rem"
                >
                  {key.contract && (
                    <Widget<TooltipProps>
                      key="tooltip"
                      loading={shortenString(key.contract)}
                      props={{
                        children: (
                          <Link href={`/address/${key.contract}`}>
                            {shortenString(key.contract)}
                          </Link>
                        ),
                        tooltip: key.contract,
                      }}
                      src={`${config_account}/widget/lite.Atoms.Tooltip`}
                    />
                  )}
                </Td>
                <Td
                  fsize="0.875rem"
                  lheight="1.25rem"
                  pbottom="1rem"
                  pleft="1rem"
                  pright="1rem"
                  ptop="1rem"
                >
                  <Widget<TooltipProps>
                    key="tooltip"
                    loading={
                      <span className="method-span-loader">{key.methods}</span>
                    }
                    props={{
                      children: (
                        <span className="method-span-loader">
                          {key.methods}
                        </span>
                      ),
                      tooltip: key.methods,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Tooltip`}
                  />
                </Td>
                <Td
                  fsize="0.875rem"
                  lheight="1.25rem"
                  pbottom="1rem"
                  pleft="1rem"
                  pright="1.5rem"
                  ptop="1rem"
                >
                  {key.allowance
                    ? `${formatNumber(yoctoToNear(key.allowance), 4)} Ⓝ`
                    : ''}
                </Td>
              </Tr>
            ))
          ) : error ? (
            <tr>
              <Td
                color="rgb(var(--color-text-label))"
                colSpan={5}
                fsize="0.875rem"
                fweight="500"
                lheight="1.25rem"
                pbottom="1rem"
                pleft="1.5rem"
                pright="1.5rem"
                ptop="1rem"
              >
                Error fetching access keys
              </Td>
            </tr>
          ) : (
            <tr>
              <Td
                color="rgb(var(--color-text-label))"
                colSpan={5}
                fsize="0.875rem"
                fweight="500"
                lheight="1.25rem"
                pbottom="1rem"
                pleft="1.5rem"
                pright="1.5rem"
                ptop="1rem"
              >
                No access keys
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination>
        <div className="container">
          <PrevButton
            color="rgb(var(--color-text-label))"
            disabled={page <= 1}
            fsize="0.75rem"
            fweight="400"
            lheight="1rem"
            mbottom="1rem"
            mright="1rem"
            mtop="1rem"
            onClick={onPrev}
            pbottom="0.25rem"
            pleft="0.5rem"
            pright="0.5rem"
            ptop="0.25rem"
          >
            Prev
          </PrevButton>
          <div className="page">Page {page}</div>
          <NextButton
            color="rgb(var(--color-text-label))"
            disabled={page >= pages}
            fsize="0.75rem"
            fweight="400"
            lheight="1rem"
            mbottom="1rem"
            mleft="1rem"
            mtop="1rem"
            onClick={onNext}
            pbottom="0.25rem"
            pleft="0.5rem"
            pright="0.5rem"
            ptop="0.25rem"
          >
            Next
          </NextButton>
        </div>
      </Pagination>
    </Container>
  );
};

export default Keys;
