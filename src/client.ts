import fetch, { RequestInit as NodeRequestInit } from "node-fetch";
import { HttpClientRequestConfig, HttpClientResponse } from "./types";

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

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

  async request<T = any, D = any>(
    config: HttpClientRequestConfig<D>,
  ): Promise<HttpClientResponse<T>> {
    const { url, method = "GET", headers, params, data } = config;

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
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();

    return {
      data: responseData as T,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      config,
    };
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
