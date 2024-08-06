"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchStreamerMessage = exports.listBlocks = void 0;
const utils_1 = require("./utils");
const client_s3_1 = require("@aws-sdk/client-s3");
const utils_2 = require("./utils");
// Queries the list of the objects in the bucket, grouped by "/" delimiter.
// Returns the list of blocks that can be fetched
// See more about data structure https://github.com/near/near-lake#data-structure
function listBlocks(client, bucketName, startAfter, limit = 200) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield client.send(new client_s3_1.ListObjectsV2Command({
            Bucket: bucketName,
            MaxKeys: limit,
            Delimiter: "/",
            StartAfter: (0, utils_2.normalizeBlockHeight)(startAfter),
            RequestPayer: "requester",
        }));
        return (data.CommonPrefixes || []).map((p) => parseInt(p.Prefix.split("/")[0]));
    });
}
exports.listBlocks = listBlocks;
// By the given block height gets the objects:
// - block.json
// - shard_N.json
// Returns the result as `StreamerMessage`
function fetchStreamerMessage(client, bucketName, blockHeight) {
    return __awaiter(this, void 0, void 0, function* () {
        const block = yield fetchBlock(client, bucketName, blockHeight);
        const shards = yield fetchShards(client, bucketName, blockHeight, block.chunks.length);
        return { block, shards };
    });
}
exports.fetchStreamerMessage = fetchStreamerMessage;
// By the given block height gets the block.json
// Reads the content of the objects and parses as a JSON.
function fetchBlock(client, bucketName, blockHeight) {
    return __awaiter(this, void 0, void 0, function* () {
        let retryCount = 0;
        while (true) {
            try {
                const data = yield client.send(new client_s3_1.GetObjectCommand({
                    Bucket: bucketName,
                    Key: `${(0, utils_2.normalizeBlockHeight)(blockHeight)}/block.json`,
                    RequestPayer: "requester",
                }));
                const block = yield (0, utils_2.parseBody)(data.Body);
                return block;
            }
            catch (err) {
                if (retryCount > 0) {
                    console.warn(`Failed to fetch ${blockHeight}/block.json. Retrying in 200ms`, err);
                }
                retryCount++;
                yield (0, utils_1.sleep)(200);
            }
        }
    });
}
// By the given block height gets the shard_N.json files
// Reads the content of the objects and parses as a JSON.
function fetchShards(client, bucketName, blockHeight, numberOfShards) {
    return __awaiter(this, void 0, void 0, function* () {
        if (numberOfShards === 0)
            return [];
        return yield Promise.all([...Array(numberOfShards).keys()].map((index) => __awaiter(this, void 0, void 0, function* () { return fetchSingleShard(client, bucketName, blockHeight, index); })));
    });
}
function fetchSingleShard(client, bucketName, blockHeight, shardId) {
    return __awaiter(this, void 0, void 0, function* () {
        let retryCount = 0;
        while (true) {
            try {
                const data = yield client.send(new client_s3_1.GetObjectCommand({
                    Bucket: bucketName,
                    Key: `${(0, utils_2.normalizeBlockHeight)(blockHeight)}/shard_${shardId}.json`,
                    RequestPayer: "requester",
                }));
                const shard = yield (0, utils_2.parseBody)(data.Body);
                return shard;
            }
            catch (err) {
                if (retryCount > 0) {
                    console.warn(`Failed to fetch ${blockHeight}/shard_${shardId}.json. Retrying in 200ms`, err);
                }
                retryCount++;
                yield (0, utils_1.sleep)(200);
            }
        }
    });
}
