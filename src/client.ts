import fetch, { RequestInit as NodeRequestInit } from "node-fetch";
import { HttpClientRequestConfig, HttpClientResponse } from "./types";
import { createHttpError } from "./errors";

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

  async request<T = any, D = any>(
    config: HttpClientRequestConfig<D>,
  ): Promise<HttpClientResponse<T>> {
    let currentConfig: HttpClientRequestConfig<D> = { ...config };

    for (const interceptor of this.requestInterceptors) {
      currentConfig = await interceptor(currentConfig);
    }

    const { url, method = "GET", headers, params, data } = currentConfig;

    const fullURL = this.buildURL(url, params);

    const fetchOptions: NodeRequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      body:
        method === "GET" || method === "DELETE"
          ? undefined
          : JSON.stringify(data),
    };

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
        `HttpError ${response.status}`,
        errorData,
        currentConfig,
      );
    }

    const responseData = await response.json();

    let currentResponse: HttpClientResponse<T> = {
      data: responseData as T,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      config,
    };

    for (const interceptor of this.responseInterceptors) {
      currentResponse = await (interceptor as ResponseInterceptor<T>)(
        currentResponse,
      );
    }
    return currentResponse;
  }

  get<T = any>(
    url: string,
    config?: Omit<HttpClientRequestConfig, "url" | "method" | "data">,
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>({
      url,
      method: "GET",
      ...config,
    });
  }

  post<T = any, D = any>(
    url: string,
    data?: D,
    config?: Omit<HttpClientRequestConfig, "url" | "method" | "data">,
  ): Promise<HttpClientResponse<T>> {
    return this.request<T, D>({
      url,
      method: "POST",
      data,
      ...config,
    });
  }

  put<T = any, D = any>(
    url: string,
    data?: D,
    config?: Omit<HttpClientRequestConfig, "url" | "method" | "data">,
  ): Promise<HttpClientResponse<T>> {
    return this.request<T, D>({
      url,
      method: "PUT",
      data,
      ...config,
    });
  }

  patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: Omit<HttpClientRequestConfig, "url" | "method" | "data">,
  ): Promise<HttpClientResponse<T>> {
    return this.request<T, D>({
      url,
      method: "PATCH",
      data,
      ...config,
    });
  }

  delete<T = any>(
    url: string,
    config?: Omit<HttpClientRequestConfig, "url" | "method" | "data">,
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>({
      url,
      method: "GET",
      ...config,
    });
  }
}
