export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "HEAD";

export interface HttpRequestConfig {
  url: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
}

export interface HttpResponseConfig<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: HttpRequestConfig;
}

export interface HttpClientRequestConfig<D = any> extends Omit<
  HttpRequestConfig,
  "data"
> {
  data?: D;
}
