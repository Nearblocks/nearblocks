import { formatLine } from '@/includes/near';
import { ReceiptStatsProps } from '@/includes/types';

const ReceiptStatus = (props: ReceiptStatsProps) => {
  const { receipt } = props;

  function hexDump(
    data: any,
    options: {
      width?: number;
      format?: string;
    },
  ) {
    const { width = 16, format = 'default' } = options;

    let result = '';
    let line = '';

    for (let i = 0; i < data.length; i++) {
      if (i > 0 && i % width === 0) {
        result += formatLine(line, i - width, format) + '\n';
        line = '';
      }

      const byte = data[i];
      line += byte.toString(16).padStart(2, '0') + ' ';
    }

    if (line.length > 0) {
      result +=
        formatLine(line, data.length - (data.length % width), format) + '\n';
    }

    return result;
  }

  function displayArgs(args: any) {
    if (!args || typeof args === 'undefined') return 'The arguments are empty';

    let pretty = '';
    const decoded = Buffer.from(args, 'base64');

    try {
      const parsed = JSON.parse(decoded.toString());
      pretty = JSON.stringify(parsed, null, 2);
    } catch {
      pretty = hexDump(decoded, { format: 'twos' });
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
        className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 p-3 mt-3 resize-y"
      ></textarea>
    );
  }

  if (status && 'Failure' in status) {
    return (
      <textarea
        readOnly
        rows={4}
        defaultValue={JSON.stringify(status.Failure, null, 2)}
        className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 p-3 mt-3 resize-y"
      ></textarea>
    );
  }

  if (status && 'SuccessReceiptId' in status) {
    return status.SuccessReceiptId;
  }

  return '';
};

export default ReceiptStatus;
