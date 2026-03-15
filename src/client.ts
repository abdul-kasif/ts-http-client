import fetch, { RequestInit as NodeRequestInit } from "node-fetch";
import { HttpClientRequestConfig, HttpResponseConfig } from "./types";

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
  ): Promise<HttpResponseConfig<T>> {
    const { url, method = "GET", headers, params, data } = config;

    const fullURL = this.buildURL(url, params);

    const fetchOptions: NodeRequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      body:
        method === "GET" || method === "HEAD"
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
}
