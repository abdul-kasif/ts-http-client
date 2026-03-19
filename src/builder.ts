import { BaseHttpError, createHttpError } from "./errors";
import {
  HttpClientRequestConfig,
  HttpClientResponse,
  HttpMethod,
} from "./types";
import fetch, { RequestInit as NodeRequestInit } from "node-fetch";

export class RequestBuilder<T = any, D = any> implements PromiseLike<
  HttpClientResponse<T>
> {
  private config: HttpClientRequestConfig<D>;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: any[];
  private responseInterceptors: any[];

  private maxRetries: number = 0;
  private baseDelay: number = 1000;

  private promise: Promise<HttpClientResponse<T>>;

  private hasExecuted: boolean = false;

  constructor(
    url: string,
    method: HttpMethod,
    baseURL: string,
    defaultHeaders: Record<string, string>,
    requestInterceptors: any[],
    responseInterceptors: any[],
  ) {
    this.config = { url, method };
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
    this.requestInterceptors = requestInterceptors;
    this.responseInterceptors = responseInterceptors;

    this.promise = new Promise(() => {});
  }

  retry(count: number, delayMs: number): this {
    this.maxRetries = count;
    this.baseDelay = delayMs;
    return this;
  }

  setHeaders(headers: Record<string, string>): this {
    this.config.headers = { ...this.config.headers, ...headers };
    return this;
  }

  query(params: Record<string, any>): this {
    this.config.params = { ...this.config.params, ...params };
    return this;
  }

  private execute(): Promise<HttpClientResponse<T>> {
    if (this.hasExecuted) {
      return this.promise;
    }
    this.hasExecuted = true;

    this.promise = (async () => {
      let currentConfig = { ...this.config };

      for (const interceptor of this.requestInterceptors) {
        currentConfig = await interceptor(currentConfig);
      }

      const { url, method = "GET", headers, params, data } = currentConfig;
      const fullURL = this.buildURL(url, params);

      const fetchOptions: NodeRequestInit = {
        method,
        headers: { ...this.defaultHeaders, ...headers },
        body:
          method === "GET" || method === "HEAD"
            ? undefined
            : JSON.stringify(data),
      };

      try {
        const response = await fetch(fullURL, fetchOptions);

        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { message: response.statusText };
          }

          throw createHttpError(
            response.status,
            response.statusText,
            `HTTP Error`,
            errorData,
            currentConfig,
          );
        }

        const responseData = await response.json();

        let finalResponse: HttpClientResponse<T> = {
          data: responseData as T,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          config: currentConfig,
        };

        for (const interceptor of this.responseInterceptors) {
          finalResponse = await interceptor(finalResponse);
        }

        return finalResponse;
      } catch (error) {
        const isRetryable =
          error instanceof BaseHttpError ? error.status >= 500 : true;

        if (isRetryable && this.maxRetries > 0) {
          let attempt = 1;
          while (attempt <= this.maxRetries) {
            const delay = this.baseDelay * Math.pow(2, attempt - 1);
            console.log(
              `Retrying ${attempt}/${this.maxRetries} after ${delay}ms...`,
            );
            await new Promise((res) => setTimeout(res, delay));

            const retryResp = await fetch(fullURL, fetchOptions);
            if (retryResp.ok) {
              const retryData = await retryResp.json();
              let retryFinal: HttpClientResponse<T> = {
                data: retryData as T,
                status: retryResp.status,
                statusText: retryResp.statusText,
                headers: Object.fromEntries(retryResp.headers.entries()),
                config: currentConfig,
              };
              for (const interceptor of this.responseInterceptors) {
                retryFinal = await interceptor(retryFinal);
              }
              return retryFinal;
            }
            attempt++;
          }
        }
        throw error;
      }
    })();

    return this.promise;
  }

  send(): Promise<HttpClientResponse<T>> {
    return this.execute();
  }

  then<TResult1 = HttpClientResponse<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: HttpClientResponse<T>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  get [Symbol.toStringTag]() {
    return "Promise";
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value != null && value != undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }
}
