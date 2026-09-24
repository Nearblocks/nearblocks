import { BlockResult } from 'near-api-js/lib/providers/provider';

type QueryResponse = {
  data?: any;
  error?: any;
  statusCode: number;
};

export const fetchJsonRpc = async (
  rpcUrl: string,
  params: any,
  method: string = 'query',
): Promise<QueryResponse> => {
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dontcare',
        method,
        params,
      }),
    });
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      return {
        statusCode: res.status,
        error: {
          message: 'Invalid JSON response',
          raw: text.substring(0, 200),
        },
      };
    }
    if (body.error) {
      return {
        statusCode: res.status,
        error: body.error,
      };
    }
    return {
      statusCode: res.status,
      ...(res.ok ? { data: body } : { error: body }),
    };
  } catch (fetchError) {
    console.error('Fetch error:', fetchError);
    return {
      statusCode: 0,
      error: { message: 'Network error', details: fetchError },
    };
  }
};

export const getBlockDetails = async (
  rpcUrl: string,
  blockId: number | string,
): Promise<BlockResult | null> => {
  try {
    const { data, error } = await fetchJsonRpc(
      rpcUrl,
      { block_id: blockId },
      'block',
    );
    if (data) {
      return data.result as BlockResult;
    } else {
      throw new Error(error);
    }
  } catch (error) {
    console.error('Error fetching latest block details:', error);
    return null;
  }
};

export const transactionStatus = async (
  rpcUrl: string,
  hash: string,
  signer: string,
  cacheRef: any,
) => {
  const cacheKey = `${hash}_${signer}`;
  if (cacheRef.current[cacheKey]) {
    return cacheRef.current[cacheKey];
  }

  const { data, error, statusCode } = await fetchJsonRpc(
    rpcUrl,
    {
      tx_hash: hash,
      sender_account_id: signer,
      wait_until: 'NONE',
    },
    'EXPERIMENTAL_tx_status',
  );

  if (statusCode === 200) {
    const result = data?.result;
    if (result && result?.final_execution_status !== 'NONE') {
      cacheRef.current[cacheKey] = result;
      return { success: true, data: result, statusCode };
    } else {
      return {
        success: false,
        error: data?.error ?? data?.result,
        statusCode,
      };
    }
  }
  return {
    success: false,
    error: error || data?.error || 'Request failed',
    statusCode,
  };
};
