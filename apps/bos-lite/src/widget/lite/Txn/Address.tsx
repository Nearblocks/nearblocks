import type { CopyProps } from '@/Atoms/Copy';
import type { TooltipProps } from '@/Atoms/Tooltip';
import type { UtilsModule } from '@/libs/utils';

export type AddressProps = {
  address: string;
};

const Address = ({ address }: AddressProps) => {
  let { shortenString } = VM.require<UtilsModule>(
    `${config_account}/widget/lite.libs.utils`,
  );

  shortenString = shortenString || (() => <></>);

  return (
    <div className="flex items-center pb-3">
      <span className="inline-block h-4 w-4 rounded-full bg-bg-skeleton mr-3" />
      <span className="flex font-heading font-semibold text-sm group">
        <Link href={`/address/${address}`}>
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
            buttonClassName: 'w-4 ml-1',
            className: 'hidden text-primary w-3.5 group-hover:block',
            text: address,
          }}
          src={`${config_account}/widget/lite.Atoms.Copy`}
        />
      </span>
    </div>
  );
};

export default Address;
