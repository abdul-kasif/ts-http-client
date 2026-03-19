import { HttpClientRequestConfig, HttpClientResponse } from "./types";
import { RequestBuilder } from "./builder";

type RequestInterceptor = (
  config: HttpClientRequestConfig,
) => HttpClientRequestConfig | Promise<HttpClientRequestConfig>;

type ResponseInterceptor<T = any> = (
  reponse: HttpClientResponse<T>,
) => HttpClientResponse | Promise<HttpClientResponse>;

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
  }

  public interceptor = {
    request: {
      use: (fn: RequestInterceptor) => {
        this.requestInterceptors.push(fn);
      },
    },

    response: {
      use: <T = any>(fn: ResponseInterceptor<T>) => {
        this.responseInterceptors.push(fn as ResponseInterceptor);
      },
    },
  };

  get<T = any>(url: string): RequestBuilder<T> {
    return new RequestBuilder<T>(
      url,
      "GET",
      this.baseURL,
      this.defaultHeaders,
      this.requestInterceptors,
      this.responseInterceptors,
    );
  }

  post<T = any, D = any>(url: string, data?: D): RequestBuilder<T, D> {
    const builder = new RequestBuilder<T, D>(
      url,
      "POST",
      this.baseURL,
      this.defaultHeaders,
      this.requestInterceptors,
      this.responseInterceptors,
    );
    if (data !== undefined) {
      (builder as any).config.data = data;
    }
    return builder;
  }

  put<T = any, D = any>(url: string, data?: D): RequestBuilder<T, D> {
    const builder = new RequestBuilder<T, D>(
      url,
      "PUT",
      this.baseURL,
      this.defaultHeaders,
      this.requestInterceptors,
      this.responseInterceptors,
    );
    if (data !== undefined) {
      (builder as any).config.data = data;
    }
    return builder;
  }

  patch<T = any, D = any>(url: string, data?: D): RequestBuilder<T, D> {
    const builder = new RequestBuilder<T, D>(
      url,
      "PATCH",
      this.baseURL,
      this.defaultHeaders,
      this.requestInterceptors,
      this.responseInterceptors,
    );
    if (data !== undefined) {
      (builder as any).config.data = data;
    }
    return builder;
  }

  delete<T = any>(url: string): RequestBuilder<T> {
    return new RequestBuilder<T>(
      url,
      "DELETE",
      this.baseURL,
      this.defaultHeaders,
      this.requestInterceptors,
      this.responseInterceptors,
    );
  }
}
