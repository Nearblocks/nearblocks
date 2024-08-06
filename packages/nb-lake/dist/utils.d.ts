/// <reference types="node" />
import { Readable } from "stream";
export declare const sleep: (pause: number) => Promise<unknown>;
export declare function normalizeBlockHeight(number: number): string;
export declare function parseBody<T>(stream: Readable): Promise<T>;
