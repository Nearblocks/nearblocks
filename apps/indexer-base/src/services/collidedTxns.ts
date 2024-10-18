import { logger } from 'nb-logger';
import { ExecutionOutcomeStatus, JsonObject, Network } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import knex from '#libs/knex';

const key = 'collided-txns';
const value = { sync: true } as JsonObject;
const txns = [
  {
    block_timestamp: '1605411776003204444',
    converted_into_receipt_id: 'FA9zcm7WkWxdjkub7WFiKkQdnnQrcEmBht94VFzXfkm1',
    included_in_block_hash: 'CVMvbRjcTJ4cbJsn2fNqWQgXmUffWsJs2pg2chRRnSDf',
    included_in_chunk_hash: 'AM1RhBBiGx6Bwe3ZibhDzqB9XbgjJdHZkJjjdRdxkxXk',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 255548500000,
    receipt_conversion_tokens_burnt: '25554850000000000000',
    receiver_account_id:
      '5efd95b2c02250eb71c8d603655b695cf8068c9bad40495ecbfae598b42b6707',
    signer_account_id:
      '5efd95b2c02250eb71c8d603655b695cf8068c9bad40495ecbfae598b42b6707',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      'J4CZZQrZK6kYPVLkrdbTEpcqhUNZiRxktbMzHviqeGgf_issue84_22633807',
  },
  {
    block_timestamp: '1606287213702078336',
    converted_into_receipt_id: '4GseTAogsiBPsk4QukMpR1nuF178U7JxBVeVVkBkMjdP',
    included_in_block_hash: '9DFtv5vcExascyCxDFJGGZ2jL3ymGAGC7PcY1DDwGPsj',
    included_in_chunk_hash: '2vtajgULZp2xzQw46GKQruTBB726Ak2WVKqjfTgwtCBG',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 255548500000,
    receipt_conversion_tokens_burnt: '25554850000000000000',
    receiver_account_id: 'f1125.bridge.near',
    signer_account_id: 'f1125.bridge.near',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      '7CC296P3iL1iCtyagZuijLCznsQgEKeQJyTCeAqDzgzi_issue84_23578941',
  },
  {
    block_timestamp: '1611356053156222968',
    converted_into_receipt_id: 'CGvxBZDXM4ySuTWFbc8APTCZoJghNUvuH8Gx8eDYfcvb',
    included_in_block_hash: '3WNZccWAsiCf7voxx5wwFGzUs91RDhRkLsoqiexTiTtp',
    included_in_chunk_hash: 'F7AAzSpdjDKp4ULbXG1VKTQShxXG5RS3G3gV1yui2gpv',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 255548500000,
    receipt_conversion_tokens_burnt: '25554850000000000000',
    receiver_account_id:
      'ae384ca1c2c93a4029e34fb52a5f72adebc5ff10b8b35fdd628ab2e7c874d088',
    signer_account_id:
      'ae384ca1c2c93a4029e34fb52a5f72adebc5ff10b8b35fdd628ab2e7c874d088',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      'FyDktRsKDM1DiGtWzzKBbcRt3MJNxUekhKEfFysvjXuw_issue84_28186615',
  },
  {
    block_timestamp: '1618677571017951085',
    converted_into_receipt_id: 'AdwJyP7Hc52736RkEZZ9ysu2Ud1WGDfovPgj94ZWk8qP',
    included_in_block_hash: 'CnhHKcxBtFpqYvCc29Pi327sLK1mbPovca1h3AeQcxhC',
    included_in_chunk_hash: 'PKJPrjWWDsx1q1Mf3iBqcKr6LxZKfrSyeVCGtkevXkC',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 255548500000,
    receipt_conversion_tokens_burnt: '25554850000000000000',
    receiver_account_id:
      '9807f85f65c59573d247ba3ef9a3fb3a7ff1cd5c33a851237c337127b486ecfb',
    signer_account_id:
      '9807f85f65c59573d247ba3ef9a3fb3a7ff1cd5c33a851237c337127b486ecfb',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      'AUh97Kbbg962AfqnQTnmM7tSSy5rnczZ99xXNjAxkctL_issue84_35028488',
  },
  {
    block_timestamp: '1619512643261281379',
    converted_into_receipt_id: '9R6ntAUUCL7jmvAmbyWEtTyGwPxMyFR18YDmGn3VK6Fd',
    included_in_block_hash: '55xwTwSusPK7VpGwvEKpREFA9A8CzrrNxbF1heDWt84E',
    included_in_chunk_hash: '99ZmEGDD5ws1Zhy1weP6S9cTeDQScvSritm8W7FjoE1j',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 2428187076146,
    receipt_conversion_tokens_burnt: '242818707614600000000',
    receiver_account_id: 'near',
    signer_account_id:
      'd4f30331b6572fceabf29f661c1581b205a2e11d9b1d6485ee71fedc55aae7f2',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      '56t8ceK2B8BympLJ6gPL3CYsdPMJiWSegsCEFsAhcAj7_issue84_35855114',
  },
  {
    block_timestamp: '1620181293054054912',
    converted_into_receipt_id: 'ACnjDeumJZeWZoSMAbAw2L2EaeuhmkA44taZbtxDAhBv',
    included_in_block_hash: '62wiRNREHRJeqxFt2wJLU61mVJUWCpGuupkdP22UrDZK',
    included_in_chunk_hash: 'HGMgZX2MiDr4Nu4M6y625EdVhBsGVG5mwPVBptHsH23o',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 2428421849216,
    receipt_conversion_tokens_burnt: '242842184921600000000',
    receiver_account_id: 'trantuyennuce.near',
    signer_account_id: 'trantuyennuce.near',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      '2cmob9xw2x8jGRi318qRfhAvUuZzfr7gX5DQPDPtAmo9_issue84_36525069',
  },
  {
    block_timestamp: '1620320736903672858',
    converted_into_receipt_id: 'HZSFnEqodMsqTQ2AnDnrYDEk6sARxNTofwomHEEFW8ak',
    included_in_block_hash: 'BvXmXNGPP2MYczzH6HSkgMxC2PKGxTpkT2WZBBHWM5vy',
    included_in_chunk_hash: 'BQpGzN399h5AkLJJVAhoEUne1DWzjNrA995juKU7XRzC',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 2427990313954,
    receipt_conversion_tokens_burnt: '242799031395400000000',
    receiver_account_id: 'tburd.near',
    signer_account_id: 'tburd.near',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      'BXpvf5cnQsYkdcFhDv9SDbHESkKe7Q9S4vKRMHsXuNw8_issue84_36661699',
  },
  {
    block_timestamp: '1620606267006958289',
    converted_into_receipt_id: '9bJxLdRQMKYHAMrkYuaPtmEV4o3i8cCVTeK5z1uUfAra',
    included_in_block_hash: '6zjpEPsbWv2jqHZ2iLnawY68zsAp9zW9X1H47xnqiU8b',
    included_in_chunk_hash: '9mg1QtVnpfA692ZZh7Bcj4Uk6vRDe3uJBkqZacShmpEB',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 2427988078020,
    receipt_conversion_tokens_burnt: '242798807802000000000',
    receiver_account_id: 'lucascao.near',
    signer_account_id: 'lucascao.near',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      'FsDPP4gPqzTuc1WbuGJ8CVSobz8PNJeDxLfGQq7Mnysk_issue84_36945373',
  },
  {
    block_timestamp: '1620606271983054007',
    converted_into_receipt_id: '8hohuvs11nLHtv38EFdeR1oxguRwecaiHbEKcJ3PTdUG',
    included_in_block_hash: 'H5Y2cK9HjvAzumsK5p1w3cvcJ9f24jrAMn8gKoCvLzwg',
    included_in_chunk_hash: '6eis61s8kZsD939hjn7wPvqtyDSWxjnYchefhXZeetu3',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 2436623255128,
    receipt_conversion_tokens_burnt: '243662325512800000000',
    receiver_account_id: 'lucascao.near',
    signer_account_id: 'lucascao.near',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      '9tWidTU62N2YZvwEzzKPycYgr5odzGm7yLEUxVdDRtdU_issue84_36945378',
  },
  {
    block_timestamp: '1621679711506364144',
    converted_into_receipt_id: 'HoJsb2YP3A5G6xCU8pP4h3vY8P2vnABiJm1cfddyVCja',
    included_in_block_hash: 'DAqsmghuAqZFpWkoJ1vd4Gmi8rdhFC4fUuJkXC8FB8gt',
    included_in_chunk_hash: '8PSunvDuZ6azzgBSaYxLrdJBNg1JaGs2DT2phF8N4JzN',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 2430358168060,
    receipt_conversion_tokens_burnt: '243035816806000000000',
    receiver_account_id: 'jupiter2410.near',
    signer_account_id: 'jupiter2410.near',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      '5pzyWUKLf2BnvjjdCVFQCXG9BPX9uvXoVDBEWVsiZUC1_issue84_37997958',
  },
  {
    block_timestamp: '1637735519834610296',
    converted_into_receipt_id: 'EqoNXpPnmNsrowbZ8RT3622BNQnseG4UzzppT2LuVCzn',
    included_in_block_hash: '6DnGygX4mTMLfWSv8uqEyhmvBSgcWAb1nVHLygBEbqui',
    included_in_chunk_hash: '7rJaFabpw4Ei1yHpw8LDoYjWLhQnatCPh98SaFQRQWnT',
    index_in_chunk: 1,
    receipt_conversion_gas_burnt: 2428169188674,
    receipt_conversion_tokens_burnt: '242816918867400000000',
    receiver_account_id: 'near',
    signer_account_id:
      'e8738cd4444c79bbc48695b94cf5ae4b1dd30cb6a2494b315d5aaf7bf7f171da',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      'B6T2JbS5jECMJPHcdmT4vsFeQyHX7WSnjhBmUTnK97yk_issue84_53430480',
  },
  {
    block_timestamp: '1638033153810397877',
    converted_into_receipt_id: '6BSzbGBgma5WAiZ9d1d9MHB1KNihk6aWh3UZ8WH39ofd',
    included_in_block_hash: 'ANmxyEHWjXxxjVkLosLHLPJAwQrEeYKGMbsvafRcUTji',
    included_in_chunk_hash: '5tjyqvsTxtZVR8ACE8qBPXDz5UNm1ERLG14s45rDWeUh',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 2428187076146,
    receipt_conversion_tokens_burnt: '242818707614600000000',
    receiver_account_id: 'near',
    signer_account_id:
      '7194dd691e07691707094d013fac723e9b6e1455e691744770e0ab295247be0e',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      '3ucQB2aT9GovCF4TLfhryqyQhs1TuGrybsBrebyAzuHJ_issue84_53719633',
  },
  {
    block_timestamp: '1641217271336137845',
    converted_into_receipt_id: '7RdRn7dTmG6PqwDD4wUpqox11BcDZneoV7CdPY72niZ1',
    included_in_block_hash: 'C7YXnDdpq7jYrFYEsbhqKmaNhMwvvpnohaJNwt8C4AEi',
    included_in_chunk_hash: '3UmKjXvAWmS5LTgWMeEAnUuqSCyZUooC9PvtZeEbHirV',
    index_in_chunk: 1,
    receipt_conversion_gas_burnt: 255548500000,
    receipt_conversion_tokens_burnt: '25554850000000000000',
    receiver_account_id:
      '46f91b34178414769429bfe357e301f38a8d690faf38f4b4be88f79277a8469c',
    signer_account_id:
      '46f91b34178414769429bfe357e301f38a8d690faf38f4b4be88f79277a8469c',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      'BUGpeYLAp3TvxEj2CgAXK2h7qfB19jF6Ust51ZqNJz4v_issue84_56609851',
  },
  {
    block_timestamp: '1641253646035380988',
    converted_into_receipt_id: 'AMJ36wde35hKXY4aM3vUWUnYxozfLKjeRnGkAJXsN4Ze',
    included_in_block_hash: '4vMeALVKr3uPYb6VRxbzN2HtZbhhvo6khynhgNZFNSdq',
    included_in_chunk_hash: '5od3b4ornyfmYwFEM6Q5FhR1CHtJYNv9GyhfS9vt2LhD',
    index_in_chunk: 3,
    receipt_conversion_gas_burnt: 255548500000,
    receipt_conversion_tokens_burnt: '25554850000000000000',
    receiver_account_id:
      '9bec3da2fb79889fb712e5783922f967cb40efa75d0a26fae82b36a6ba5f1436',
    signer_account_id:
      '9bec3da2fb79889fb712e5783922f967cb40efa75d0a26fae82b36a6ba5f1436',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      'J4s3ghYCeoQQdSag4fHruPLy8B9Jg2MhKMFYsbRuG6Ak_issue84_56640424',
  },
  {
    block_timestamp: '1642264272134526536',
    converted_into_receipt_id: 'HC5jnbLChPHCzKDwXYHXGdghSFfv2NEb21eswSvV3mQ8',
    included_in_block_hash: '3a1RD9181HcSAJGf3i3hewLeZhKf89qGE39xC3AsUmni',
    included_in_chunk_hash: '137d4PPd6EHnGjqWMqcKGFUUYencELJQFrDEiBKGhrbM',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 2428169188674,
    receipt_conversion_tokens_burnt: '242816918867400000000',
    receiver_account_id: 'near',
    signer_account_id:
      '1f59eb88229712195b48dded131f6ff9df76b3d220e567b4ec6bf1195ff4bff9',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      '6zZ7yEVS8RLEeDRNmQN8svWMjWwhc3UFyu9L7gkquHFR_issue84_57465248',
  },
  {
    block_timestamp: '1642273080675083991',
    converted_into_receipt_id: 'Hkc9JReqGfr9GGh3iNfehw3NZbLRHiepF9MMtxKgfLcm',
    included_in_block_hash: 'BgLqLmWj7B9GpnygdQUAkm74Wpv63Pbvnjy7uAyV58ow',
    included_in_chunk_hash: '6ZHkeso2ENCBjwKLGXPDPWRYgdJjhkjdeZ974sp3HpQd',
    index_in_chunk: 1,
    receipt_conversion_gas_burnt: 255548500000,
    receipt_conversion_tokens_burnt: '25554850000000000000',
    receiver_account_id:
      '877f59fdd7220ff8fa4d6dd817ad37667b29cbb59734cc9d512c2d5e0f5b63db',
    signer_account_id:
      '877f59fdd7220ff8fa4d6dd817ad37667b29cbb59734cc9d512c2d5e0f5b63db',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      'H4Eh2avNzmJcKUuNcjPi6uLF27ypt6nugWEkccGW23p7_issue84_57471565',
  },
  {
    block_timestamp: '1642345298782270852',
    converted_into_receipt_id: '4sGsDJ35x17aFf6r43GynTAho2HcvYpLvKsFCnhoc7xV',
    included_in_block_hash: '38K1xsTQgMcxtpbGzFHnLsGQtvb3ueWDyKvj74nXHHmi',
    included_in_chunk_hash: 'BUYoXbJg8LYdJpni2mGSzzT5MZKUhoYgHdEGRPBbDFV5',
    index_in_chunk: 4,
    receipt_conversion_gas_burnt: 255548500000,
    receipt_conversion_tokens_burnt: '25554850000000000000',
    receiver_account_id:
      '5815511ebe65156c115206576c09e82b99a89baf136d4708270a234f2cc3087d',
    signer_account_id:
      '5815511ebe65156c115206576c09e82b99a89baf136d4708270a234f2cc3087d',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      'GHLd5q4vtD2QCeu7bdrowP5v7quebCnQxczH3u55FZ8d_issue84_57523330',
  },
  {
    block_timestamp: '1642814893719438212',
    converted_into_receipt_id: '6eRhroghfWkhYytZ9LDtGVpRRRVx3g6vvcXGpQCekk9b',
    included_in_block_hash: '9gsfGmADj3mrn3gTDVt7X1ncavoy7bFuqfB92v3VSDzu',
    included_in_chunk_hash: '3UJZofE1RRNHvUJW8ofXzXHBWX8xAZbw598jPd7q3exj',
    index_in_chunk: 0,
    receipt_conversion_gas_burnt: 255548500000,
    receipt_conversion_tokens_burnt: '25554850000000000000',
    receiver_account_id:
      '5a026bdb49dead324258f06bd07959433f24e8e9e093db621527de215411506d',
    signer_account_id:
      '5a026bdb49dead324258f06bd07959433f24e8e9e093db621527de215411506d',
    status: ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
    transaction_hash:
      '2DuxYYMgpeYsrGakXzQYa1K4NyuCXoUsKe3u2fgXLeLV_issue84_57870654',
  },
];

export const syncCollidedTxns = async () => {
  if (config.network !== Network.MAINNET) {
    return;
  }

  const settings = await knex('settings').where({ key }).first();

  const setting = settings?.value as JsonObject;

  if (setting?.sync) {
    logger.warn('collided txns already synced...');
    return;
  }

  logger.info('inserting collided txns...');
  await retry(async () => {
    await knex('transactions')
      .insert(txns)
      .onConflict(['transaction_hash'])
      .ignore();
  });
  await retry(async () => {
    await knex('settings').insert({ key, value }).onConflict('key').merge();
  });
  logger.info('collided txns sync finished...');
};
