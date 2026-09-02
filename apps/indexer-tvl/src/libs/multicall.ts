import { Interface } from 'ethers';

import { ethCall } from '#libs/evm';
import { NATIVE_TOKEN } from '#libs/utils';

export { NATIVE_TOKEN };

export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

const multicallIface = new Interface([
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] returnData)',
  'function getEthBalance(address addr) view returns (uint256 balance)',
]);

const erc20Iface = new Interface([
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]);

export type Call3 = { allowFailure: boolean; callData: string; target: string };
export type Result3 = { returnData: string; success: boolean };

export const nativeBalanceCall = (bridge: string): Call3 => ({
  allowFailure: false,
  callData: multicallIface.encodeFunctionData('getEthBalance', [bridge]),
  target: MULTICALL3_ADDRESS,
});

export const tokenBalanceCalls = (bridge: string, tokens: string[]): Call3[] =>
  tokens.map((token) => ({
    allowFailure: true,
    callData: erc20Iface.encodeFunctionData('balanceOf', [bridge]),
    target: token,
  }));

export const aggregate3 = async (
  url: string,
  calls: Call3[],
  blockTag: string,
): Promise<Result3[]> => {
  const data = multicallIface.encodeFunctionData('aggregate3', [calls]);
  const result = await ethCall(url, MULTICALL3_ADDRESS, data, blockTag);
  const [decoded] = multicallIface.decodeFunctionResult('aggregate3', result);

  return decoded as unknown as Result3[];
};

export const decodeBalance = (returnData: string): bigint => {
  const [value] = erc20Iface.decodeFunctionResult('balanceOf', returnData);

  return value as bigint;
};

const decodeSymbol = (returnData: string): null | string => {
  try {
    const [value] = erc20Iface.decodeFunctionResult('symbol', returnData);

    return value as string;
  } catch {
    return null;
  }
};

export const fetchTokenMeta = async (
  url: string,
  token: string,
): Promise<{ decimals: number; symbol: null | string }> => {
  const calls: Call3[] = [
    {
      allowFailure: true,
      callData: erc20Iface.encodeFunctionData('symbol'),
      target: token,
    },
    {
      allowFailure: true,
      callData: erc20Iface.encodeFunctionData('decimals'),
      target: token,
    },
  ];
  const results = await aggregate3(url, calls, 'latest');

  const symbol = results[0].success
    ? decodeSymbol(results[0].returnData)
    : null;
  const decimals = results[1].success
    ? Number(
        erc20Iface.decodeFunctionResult('decimals', results[1].returnData)[0],
      )
    : 18;

  return { decimals, symbol };
};
