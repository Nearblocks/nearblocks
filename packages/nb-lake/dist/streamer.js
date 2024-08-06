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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startStream = exports.stream = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3fetchers_1 = require("./s3fetchers");
const utils_1 = require("./utils");
const FATAL_ERRORS = ["CredentialsProviderError"];
function batchStream(config) {
    return __asyncGenerator(this, arguments, function* batchStream_1() {
        const s3Client = new client_s3_1.S3Client({
            credentials: config.credentials,
            region: config.s3RegionName,
            endpoint: config.s3Endpoint,
            forcePathStyle: config.s3ForcePathStyle
        });
        let fetchBlocks = config.fetchBlocks;
        let startBlockHeight = config.startBlockHeight;
        while (true) {
            const results = [];
            let blockHeights;
            try {
                blockHeights = yield __await(fetchBlocks(startBlockHeight, config.blocksPreloadPoolSize));
            }
            catch (err) {
                if (FATAL_ERRORS.includes(err.name)) {
                    throw err;
                }
                console.error("Failed to list blocks. Retrying.", err);
                continue;
            }
            if (blockHeights.length === 0) {
                // Throttling when there are no new blocks
                const NO_NEW_BLOCKS_THROTTLE_MS = 700;
                yield __await((0, utils_1.sleep)(NO_NEW_BLOCKS_THROTTLE_MS));
                continue;
            }
            yield yield __await(blockHeights.map(blockHeight => (0, s3fetchers_1.fetchStreamerMessage)(s3Client, config.s3BucketName, blockHeight)));
            startBlockHeight = Math.max.apply(Math, blockHeights) + 1;
        }
    });
}
function fetchAhead(seq, stepsAhead = 10) {
    return __asyncGenerator(this, arguments, function* fetchAhead_1() {
        let queue = [];
        while (true) {
            while (queue.length < stepsAhead) {
                queue.push(seq[Symbol.asyncIterator]().next());
            }
            const { value, done } = yield __await(queue.shift());
            if (done)
                return yield __await(void 0);
            yield yield __await(value);
        }
    });
}
function stream(config) {
    return __asyncGenerator(this, arguments, function* stream_1() {
        var e_1, _a;
        const s3Client = new client_s3_1.S3Client({ region: config.s3RegionName });
        let lastProcessedBlockHash;
        let startBlockHeight = config.startBlockHeight;
        while (true) {
            try {
                try {
                    for (var _b = (e_1 = void 0, __asyncValues(fetchAhead(batchStream(Object.assign(Object.assign({}, config), { startBlockHeight }))))), _c; _c = yield __await(_b.next()), !_c.done;) {
                        let promises = _c.value;
                        for (let promise of promises) {
                            const streamerMessage = yield __await(promise);
                            // check if we have `lastProcessedBlockHash` (might be not set only on start)
                            // compare lastProcessedBlockHash` with `streamerMessage.block.header.prevHash` of the current
                            // block (ensure we never skip blocks even if there is some incident on Lake Indexer side)
                            // retrieve the data from S3 if hashes don't match and repeat the main loop step
                            if (lastProcessedBlockHash &&
                                lastProcessedBlockHash !== streamerMessage.block.header.prevHash) {
                                throw new Error(`The hash of the last processed block ${lastProcessedBlockHash} doesn't match the prevHash ${streamerMessage.block.header.prevHash} of the new one ${streamerMessage.block.header.hash}.`);
                            }
                            yield yield __await(streamerMessage);
                            lastProcessedBlockHash = streamerMessage.block.header.hash;
                            startBlockHeight = streamerMessage.block.header.height + 1;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield __await(_a.call(_b));
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            catch (e) {
                if (FATAL_ERRORS.includes(e.name)) {
                    throw e;
                }
                // TODO: Should there be limit for retries?
                console.log('Retrying on error when fetching blocks', e, 'Refetching the data from S3 in 200ms');
                yield __await((0, utils_1.sleep)(200));
            }
        }
    });
}
exports.stream = stream;
function startStream(config, onStreamerMessageReceived) {
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function* () {
        let queue = [];
        try {
            for (var _b = __asyncValues(stream(config)), _c; _c = yield _b.next(), !_c.done;) {
                let streamerMessage = _c.value;
                // `queue` here is used to achieve throttling as streamer would run ahead without a stop
                // and if we start from genesis it will spawn millions of `onStreamerMessageReceived` callbacks.
                // This implementation has a pipeline that fetches the data from S3 while `onStreamerMessageReceived`
                // is being processed, so even with a queue size of 1 there is already a benefit.
                // TODO: Reliable error propagation for onStreamerMessageReceived?
                queue.push(onStreamerMessageReceived(streamerMessage));
                if (queue.length > 10) {
                    yield queue.shift();
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    });
}
exports.startStream = startStream;
