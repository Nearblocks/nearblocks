import { AccountAssetFTsRes } from 'nb-schemas';

import type { dictionary } from '@/locales/en';

export type Dictionary = typeof dictionary;

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type BaseDictionary = DeepStringify<Dictionary>;

export type RouteNamespace = keyof Dictionary;

export type RouteDictionary<R extends RouteNamespace> = Dictionary[R];

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type Primitive = bigint | boolean | null | number | string | symbol | undefined;

export type RecursiveKeyOf<T> = {
  [K in keyof T & string]: T[K] extends Primitive
    ? K
    : `${K}.${RecursiveKeyOf<T[K]>}`;
}[keyof T & string];

export type RouteKey<R extends RouteNamespace> = RecursiveKeyOf<Dictionary[R]>;

type RecursiveValueOf<T, K extends string> = K extends keyof T
  ? T[K]
  : K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? RecursiveValueOf<T[First], Rest>
    : never
  : never;

type GetParamKeys<T extends string> =
  T extends `${string}{{${infer Param}}}${infer Rest}`
    ? GetParamKeys<Rest> | Param
    : never;

export type Translator<T extends object> = <K extends RecursiveKeyOf<T>>(
  key: K,
  ...params: GetParamKeys<
    RecursiveValueOf<T, K> extends string ? RecursiveValueOf<T, K> : never
  > extends never
    ? []
    : [
        {
          [P in GetParamKeys<
            RecursiveValueOf<T, K> extends string
              ? RecursiveValueOf<T, K>
              : never
          >]: number | string;
        },
      ]
) => string;

type Without<T, U> = {
  [P in Exclude<keyof T, keyof U>]?: never;
};
type XOR<T, U> = (T & Without<U, T>) | (U & Without<T, U>);

type KeyOrTitle<K extends string = string> = XOR<{ key: K }, { title: string }>;
export type NavMenuLeafItem<K extends string = string> = KeyOrTitle<K> & {
  href: string;
  menu?: never;
};
type HrefOrMenu<K extends string = string> =
  | { href: string; menu?: never }
  | { href?: never; menu: NavMenuLeafItem<K>[] };

export type NavMenuItem<K extends string = string> = KeyOrTitle<K> &
  HrefOrMenu<K>;
export type NavMenu<K extends string = string> = NavMenuItem<K>[];

export type TokensCacheRes = {
  account_id: string;
  tokens: null | TokenCache[];
};

export type TokenCache = {
  balance: string;
  contract_id: string;
};

export type AssetToken = NonNullable<AccountAssetFTsRes['data']>[number] & {
  price: string;
};

export type TokenInventory = {
  amount: number;
  tokens: AssetToken[];
};

export type SearchParams = Record<string, string | string[] | undefined>;
