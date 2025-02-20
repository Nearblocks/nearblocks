import { types } from 'near-lake-framework';

import { Network } from 'nb-types';

export interface Config {
  dataSource: string;
  endBlockHeight: number;
  fastnearEndpoint?: string;
  nearlakeAccessKey: string;
  nearlakeBucketName: string;
  nearlakeEndpoint: null | types.EndpointConfig;
  nearlakeRegionName: string;
  nearlakeSecretKey: string;
  network: Network;
  preloadSize: number;
  s3AccessKey: string;
  s3Bucket: string;
  s3Endpoint: string;
  s3Region: string;
  s3SecretKey: string;
  startBlockHeight: number;
}
