interface Window {
  JsonView: ({
    children,
  }: {
    children: ReactNode;
    className?: string;
  }) => JSX.Element;

  Skeleton: (props: {
    children: ReactNode;
    className?: string;
    inline?: boolean;
    loading?: boolean;
  }) => JSX.Element;
}

declare module VM {
  function require<T>(src: string): T;
}

declare module VM {
  function require<T>(src: string): T;
}

declare const config_account: string;
declare const alias_api_url: string;

declare const context: {
  accountId?: string;
  loading: boolean;
  networkId: NetworkId;
  widgetSrc?: string;
};

declare const Widget: <T>(params: {
  loading?: React.ReactNode;
  props?: T;
  src: string;
}) => React.ReactNode;

declare const Link: React.ForwardRefExoticComponent<
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof InternalLinkProps> &
    InternalLinkProps & {
      children?: React.ReactNode;
    } & React.RefAttributes<HTMLAnchorElement>
>;

declare type FetchOptions = {
  body?: ArrayBuffer | Blob | FormData | string;
  headers?: { [key: string]: string };
  method?: string;
  responseType?: 'arraybuffer' | 'blob' | 'formdata' | 'json' | 'text';
};

declare type FetchResponseSuccess = {
  body: inferBodyType<FetchOptions['responseType']>;
  contentType: null | string;
  ok: boolean;
  status: number;
};

declare type FetchResponseError = {
  error: string;
  ok: false;
};

declare type FetchResponse = FetchResponseError | FetchResponseSuccess;

declare async function asyncFetch(
  url: string,
  options?: FetchOptions,
): Promise<FetchResponse>;

type inferBodyType<
  T extends 'arraybuffer' | 'blob' | 'formdata' | 'json' | 'text',
> = {
  arraybuffer: ArrayBuffer;
  blob: Blob;
  formdata: FormData;
  json: object;
  text: string;
}[T];

declare const Big;
