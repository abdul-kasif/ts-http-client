import { HttpClient } from "./client";

export { HttpClient } from "./client";

export {
  HttpMethod,
  HttpRequestConfig,
  HttpClientResponse,
  HttpClientRequestConfig,
} from "./types";

export function createHttpClient(
  baseURL: string,
  defaultHeaders?: Record<string, string>,
): HttpClient {
  return new HttpClient(baseURL, defaultHeaders);
}
