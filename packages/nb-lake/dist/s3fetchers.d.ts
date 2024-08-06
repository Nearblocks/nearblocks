import { S3Client } from "@aws-sdk/client-s3";
import { BlockHeight, StreamerMessage } from "./types";
export declare function listBlocks(client: S3Client, bucketName: string, startAfter: BlockHeight, limit?: number): Promise<BlockHeight[]>;
export declare function fetchStreamerMessage(client: S3Client, bucketName: string, blockHeight: BlockHeight): Promise<StreamerMessage>;
