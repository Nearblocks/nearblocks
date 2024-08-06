import { LakeConfig, StreamerMessage } from "./types";
export declare function stream(config: LakeConfig): AsyncIterableIterator<StreamerMessage>;
export declare function startStream(config: LakeConfig, onStreamerMessageReceived: (data: StreamerMessage) => Promise<void>): Promise<void>;
