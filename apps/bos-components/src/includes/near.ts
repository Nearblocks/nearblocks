import { localFormat } from '@/includes/formats';
import { yoctoToNear } from '@/includes/libs';

export function encodeArgs(args: object) {
  if (!args || typeof args === 'undefined') return '';

  return Buffer.from(JSON.stringify(args)).toString('base64');
}
export function decodeArgs(args: number[]) {
  if (!args || typeof args === 'undefined') return {};

  const encodedString = Buffer.from(args).toString('base64');
  return JSON.parse(Buffer.from(encodedString, 'base64').toString());
}

export function txnMethod(actions: { action: string; method: string }[]) {
  const count = actions?.length || 0;

  if (!count) return 'Unknown';
  if (count > 1) return 'Batch Transaction';

  const action = actions[0];

  if (action.action === 'FUNCTION_CALL') {
    return action.method;
  }

  return action.action;
}

export function gasPrice(yacto: number) {
  const near = Big(yoctoToNear(yacto, false)).mul(Big(10).pow(12)).toString();

  return `${localFormat(near)} Ⓝ / Tgas`;
}

export function tokenAmount(amount: number, decimal: number, format: boolean) {
  if (amount === undefined || amount === null) return 'N/A';

  const near = Big(amount).div(Big(10).pow(+decimal));

  return format
    ? near.toString().toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8,
      })
    : near;
}
