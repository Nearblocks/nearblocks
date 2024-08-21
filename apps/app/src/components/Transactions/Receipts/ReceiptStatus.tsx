import { hexy } from '@/utils/hexy';
import { ReceiptStatsProps } from '@/utils/types';

const ReceiptStatus = (props: ReceiptStatsProps) => {
  const { receipt } = props;

  function displayArgs(args: any) {
    if (!args || typeof args === 'undefined') return 'The arguments are empty';

    let pretty = '';
    const decoded = Buffer.from(args, 'base64');

    try {
      const parsed = JSON.parse(decoded.toString());
      if (parsed) {
        pretty = JSON.stringify(parsed, null, 2);
      } else {
        pretty = hexy(decoded, { format: 'twos' });
      }
    } catch {
      pretty = hexy(decoded, { format: 'twos' });
    }

    return pretty;
  }

  const status = receipt.outcome.status;
  if (status && 'SuccessValue' in status) {
    const { SuccessValue } = status;

    if (SuccessValue === null || SuccessValue === undefined) {
      return 'No Result';
    }

    if (Array.isArray(SuccessValue) || typeof SuccessValue === 'string') {
      if (SuccessValue.length === 0) {
        return 'Empty Result';
      }
    }

    return (
      <textarea
        readOnly
        rows={4}
        defaultValue={displayArgs(SuccessValue)}
        className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 mt-3 resize-y"
      ></textarea>
    );
  }

  if (status && 'Failure' in status) {
    return (
      <textarea
        readOnly
        rows={4}
        defaultValue={JSON.stringify(status.Failure, null, 2)}
        className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 mt-3 resize-y"
      ></textarea>
    );
  }

  if (status && 'SuccessReceiptId' in status) {
    return status.SuccessReceiptId;
  }

  return '';
};

export default ReceiptStatus;
