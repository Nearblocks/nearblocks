export type JsonObject = { [Key in string]?: JsonValue };

export interface JsonArray {
  [index: number]: JsonValue;
}

export type JsonValue =
  | boolean
  | JsonArray
  | JsonObject
  | null
  | number
  | string;
