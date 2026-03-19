import { HttpClient } from "./client";

export { HttpClient } from "./client";

export { RequestBuilder } from "./builder";

export {
  createHttpError,
  HttpError,
  NotFoundError,
  BaseHttpError,
  ServerError,
  UnauthorizedError,
} from "./errors";

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
