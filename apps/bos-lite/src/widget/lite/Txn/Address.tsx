import type { CopyProps } from '@/Atoms/Copy';
import type { TooltipProps } from '@/Atoms/Tooltip';
import type { UtilsModule } from '@/libs/utils';

export type AddressProps = {
  address: string;
};

let TxnAddressSkeleton = window?.TxnAddressSkeleton || (() => <></>);
const Container = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 0.75rem;
`;

const CircleSkeleton = styled.span`
  display: inline-block;
  height: 1rem;
  width: 1rem;
  border-radius: 9999px;
  background-color: rgb(var(--color-bg-skeleton));
  margin-right: 0.75rem;
`;

const FlexGroup = styled.span`
  display: flex;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.25rem;
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
  }

  .linkclass {
    color: inherit;
    text-decoration: inherit;

    &:hover {
      text-decoration: none;
    }
  }
`;

const Address = ({ address }: AddressProps) => {
  let { shortenString } = VM.require<UtilsModule>(
    `${config_account}/widget/lite.libs.utils`,
  );

  if (!shortenString) return <TxnAddressSkeleton />;

  return (
    <Container>
      <CircleSkeleton />
      <FlexGroup>
        <Link className="linkclass" href={`/address/${address}`}>
          {address.length > 22 ? (
            <Widget<TooltipProps>
              key="tooltip"
              props={{
                children: shortenString(String(address), 10, 10, 22),
                tooltip: address,
              }}
              src={`${config_account}/widget/lite.Atoms.Tooltip`}
            />
          ) : (
            address
          )}
        </Link>
        <Widget<CopyProps>
          key="copy"
          props={{
            buttonClassName: 'copyButton',
            className: 'copyIcon',
            text: address,
          }}
          src={`${config_account}/widget/lite.Atoms.Copy`}
        />
      </FlexGroup>
    </Container>
  );
};

export default Address;
