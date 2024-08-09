import type { CopyProps } from '@/Atoms/Copy';
import type { TooltipProps } from '@/Atoms/Tooltip';
import type { ConvertorModule } from '@/libs/convertor';
import type { FormatterModule } from '@/libs/formatter';
import type { UtilsModule } from '@/libs/utils';

import type { ActionProps } from './Action';

export type ActionsProps = {
  actions: Action[];
  open: boolean;
  receipt: NestedReceiptWithOutcome;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

let TxnActionSkeleton = window?.TxnActionSkeleton || (() => <></>);
let JsonView = window?.JsonView || (({ children }) => <pre>{children}</pre>);

const prettify = (args: string) => {
  try {
    return JSON.stringify(JSON.parse(atob(args)), undefined, 2);
  } catch (error) {
    return args;
  }
};
const ActionContainer = styled.div`
  &:not([hidden]) ~ :not([hidden]) {
    --tw-space-y-reverse: 0;
    margin-top: calc(0.5rem calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(0.5rem var(--tw-space-y-reverse));
  }
`;
const Section = styled.div`
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 1.5rem;
`;
const ActionOutput = styled.div`
  padding-top: 1.5rem;
  .resultClass {
    margin-bottom: 1.5rem;
  }
`;
const OutputHeading = styled.h3`
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-bottom: 0.25rem;
`;

const OutputButton = styled.button<{ isActive?: boolean }>`
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  ${(props: any) =>
    props.isActive
      ? `font-weight: 500; border-bottom-width: 3px; border-color: rgb(var(--color-text-body)); -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
  border-top: none;
  border-left: none;
  border-right: none;`
      : `color: rgb(var(--color-text-label)); background-color: transparent;
  background-image: none; border:none;`};
`;

const InspectButton = styled.button<{ isActive?: boolean }>`
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  margin-left: 1rem;
  ${(props: any) =>
    props.isActive
      ? `font-weight: 500; border-bottom-width: 3px; border-color: rgb(var(--color-text-body)); -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
  border-top: none;
  border-left: none;
  border-right: none;`
      : `color: rgb(var(--color-text-label)); background-color: transparent;
  background-image: none; border:none;`};
`;

const InspectContainer = styled.div`
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding-top: 1.5rem;
  padding-bottom: 0.75rem;
`;

const InspectDataContainer = styled.div`
  display: flex;
  align-items: center;
`;
const InspectDataHeading = styled.h3`
  width: 8rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
`;
const InspectData = styled.p`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  position: relative;
  .copyButton {
    width: 1rem;
    margin-left: 0.25rem;
  }
  .copyIcon {
    display: none;
    color: rgb(var(--color-primary));
    width: 0.875rem;
  }

  &:hover .copyIcon {
    display: block;
    color: inherit;
    text-decoration: none;
  }

  .tooltip-link {
    font-weight: 500;
    color: inherit;
    text-decoration: inherit;

    &:hover {
      text-decoration: none;
    }
  }
`;

const StyledParagraph = styled.p`
  margin-bottom: 0.5rem;
`;

const Actions = ({ actions, open, receipt, setOpen }: ActionsProps) => {
  let { yoctoToNear, yoctoToTgas } = VM.require<ConvertorModule>(
    `${config_account}/widget/lite.libs.convertor`,
  );
  let { formatNumber } = VM.require<FormatterModule>(
    `${config_account}/widget/lite.libs.formatter`,
  );
  let { gasLimit, refund, shortenString } = VM.require<UtilsModule>(
    `${config_account}/widget/lite.libs.utils`,
  );

  if (
    !yoctoToNear ||
    !yoctoToTgas ||
    !formatNumber ||
    !gasLimit ||
    !refund ||
    !shortenString
  )
    return <TxnActionSkeleton />;

  const [active, setActive] = useState('output');

  const result = useMemo(() => {
    let logs = 'No logs';
    let status = 'Empty result';

    if (receipt.outcome.logs.length) {
      logs = receipt.outcome.logs.join('\n');
    }

    if (receipt.outcome.status.type === 'successReceiptId') {
      status = receipt.outcome.status.receiptId;
    }

    if (
      receipt.outcome.status.type === 'successValue' &&
      receipt.outcome.status.value.length
    ) {
      status = prettify(receipt.outcome.status.value);
    }

    if (receipt.outcome.status.type === 'failure') {
      status = JSON.stringify(receipt.outcome.status.error, undefined, 2);
    }

    return { logs, status };
  }, [receipt]);

  return (
    <>
      <ActionContainer>
        {actions.map((action, index) => (
          <Widget<ActionProps>
            key={`action-${index}`}
            loading={<TxnActionSkeleton />}
            props={{ action, open, setOpen }}
            src={`${config_account}/widget/lite.Txn.Action`}
          />
        ))}
      </ActionContainer>
      {open && (
        <Section>
          <div>
            <OutputButton
              isActive={active === 'output'}
              onClick={() => setActive('output')}
            >
              Output
            </OutputButton>
            <InspectButton
              isActive={active === 'inspect'}
              onClick={() => setActive('inspect')}
            >
              Inspect
            </InspectButton>
          </div>
          {active === 'output' && (
            <ActionOutput>
              <OutputHeading>Logs</OutputHeading>
              <JsonView className="resultClass">{result.logs}</JsonView>
              <OutputHeading>Result</OutputHeading>
              <JsonView className="resultClass">{result.status}</JsonView>
            </ActionOutput>
          )}
          {active === 'inspect' && (
            <InspectContainer>
              <InspectDataContainer>
                <InspectDataHeading>Receipt</InspectDataHeading>
                <InspectData>
                  <Widget<TooltipProps>
                    key="tooltip"
                    props={{
                      children: shortenString(receipt.id),
                      tooltip: receipt.id,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Tooltip`}
                  />
                  <Widget<CopyProps>
                    key="copy"
                    props={{
                      buttonClassName: 'copyButton',
                      className: 'copyIcon',
                      text: receipt.id,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Copy`}
                  />
                </InspectData>
              </InspectDataContainer>
              <InspectDataContainer>
                <InspectDataHeading>Block</InspectDataHeading>
                <InspectData>
                  <Widget<TooltipProps>
                    key="tooltip"
                    props={{
                      children: (
                        <Link
                          className="tooltip-link"
                          href={`/blocks/${receipt.outcome.block.hash}`}
                        >
                          {shortenString(receipt.outcome.block.hash)}
                        </Link>
                      ),
                      tooltip: receipt.outcome.block.hash,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Tooltip`}
                  />
                  <Widget<CopyProps>
                    key="copy"
                    props={{
                      buttonClassName: 'copyButton',
                      className: 'copyIcon',
                      text: receipt.outcome.block.hash,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Copy`}
                  />
                </InspectData>
              </InspectDataContainer>
              <InspectDataContainer>
                <InspectDataHeading>From</InspectDataHeading>
                <InspectData>
                  <Widget<TooltipProps>
                    key="tooltip"
                    props={{
                      children: (
                        <Link
                          className="tooltip-link"
                          href={`/address/${receipt.predecessorId}`}
                        >
                          {shortenString(receipt.predecessorId, 10, 10, 22)}
                        </Link>
                      ),
                      tooltip: receipt.predecessorId,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Tooltip`}
                  />
                  <Widget<CopyProps>
                    key="copy"
                    props={{
                      buttonClassName: 'copyButton',
                      className: 'copyIcon',
                      text: receipt.predecessorId,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Copy`}
                  />
                </InspectData>
              </InspectDataContainer>
              <InspectDataContainer>
                <InspectDataHeading>To</InspectDataHeading>
                <InspectData>
                  <Widget<TooltipProps>
                    key="tooltip"
                    props={{
                      children: (
                        <Link
                          className="tooltip-link"
                          href={`/address/${receipt.receiverId}`}
                        >
                          {shortenString(receipt.receiverId, 10, 10, 22)}
                        </Link>
                      ),
                      tooltip: receipt.receiverId,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Tooltip`}
                  />
                  <Widget<CopyProps>
                    key="copy"
                    props={{
                      buttonClassName: 'copyButton',
                      className: 'copyIcon',
                      text: receipt.receiverId,
                    }}
                    src={`${config_account}/widget/lite.Atoms.Copy`}
                  />
                </InspectData>
              </InspectDataContainer>
              <InspectDataContainer>
                <InspectDataHeading>Gas Limit</InspectDataHeading>
                <StyledParagraph>
                  {formatNumber(yoctoToTgas(gasLimit(receipt.actions)), 2)}
                </StyledParagraph>
              </InspectDataContainer>
              <InspectDataContainer>
                <InspectDataHeading>Gas Burned</InspectDataHeading>
                <StyledParagraph>
                  {formatNumber(
                    yoctoToTgas(String(receipt.outcome.gasBurnt)),
                    2,
                  )}{' '}
                  TGas
                </StyledParagraph>
              </InspectDataContainer>
              <InspectDataContainer>
                <InspectDataHeading>Tokens Burned</InspectDataHeading>
                <StyledParagraph>
                  {formatNumber(yoctoToNear(receipt.outcome.tokensBurnt), 6)} Ⓝ
                </StyledParagraph>
              </InspectDataContainer>
              <InspectDataContainer>
                <InspectDataHeading>Refunded</InspectDataHeading>
                <StyledParagraph>
                  {formatNumber(
                    yoctoToNear(refund(receipt.outcome.nestedReceipts)),
                    6,
                  )}{' '}
                  Ⓝ
                </StyledParagraph>
              </InspectDataContainer>
            </InspectContainer>
          )}
        </Section>
      )}
    </>
  );
};

export default Actions;
