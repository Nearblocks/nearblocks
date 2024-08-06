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
exports.parseBody = exports.normalizeBlockHeight = exports.sleep = void 0;
const sleep = (pause) => new Promise((resolve) => setTimeout(resolve, pause));
exports.sleep = sleep;
// In the S3 bucket we store blocks height with prepended zeroes
// because these are string there and to avoid getting earlier
// blocks after later ones because of sorting strings issues
// we decided to prepend zeroes.
// This function normalizes the block height number into the string
function normalizeBlockHeight(number) {
    return number.toString().padStart(12, "0");
}
exports.normalizeBlockHeight = normalizeBlockHeight;
function parseBody(stream) {
    return __awaiter(this, void 0, void 0, function* () {
        const contents = yield streamToString(stream);
        const parsed = JSON.parse(contents, (key, value) => renameUnderscoreFieldsToCamelCase(value));
        return parsed;
    });
}
exports.parseBody = parseBody;
// the function got from
// https://github.com/aws/aws-sdk-js-v3/issues/1877#issuecomment-755387549
function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
}
// function renames all fields in the nested object
// from underscore_style to camelCase
function renameUnderscoreFieldsToCamelCase(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        // It's a non-null, non-array object, create a replacement with the keys initially-capped
        const newValue = {};
        for (const key in value) {
            const newKey = key
                .split("_")
                .map((word, i) => {
                if (i > 0) {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                }
                return word;
            })
                .join("");
            newValue[newKey] = value[key];
        }
        return newValue;
    }
    return value;
}
