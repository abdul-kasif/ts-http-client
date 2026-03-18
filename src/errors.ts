import { HttpRequestConfig } from "./types";

export class BaseHttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data?: any;
  public readonly config?: HttpRequestConfig;

  constructor(
    message: string,
    status: number,
    statusText: string,
    data?: any,
    config?: HttpRequestConfig,
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.config = config;
    Object.setPrototypeOf(this, BaseHttpError.prototype);
  }
}

export class NotFoundError extends BaseHttpError {
  constructor(
    message: string,
    statusText: string,
    data?: any,
    config?: HttpRequestConfig,
  ) {
    super(message, 404, statusText, data, config);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends BaseHttpError {
  constructor(
    message: string,
    statusText: string,
    data?: any,
    config?: HttpRequestConfig,
  ) {
    super(message, 401, statusText, data, config);
    this.name = "UnauthorizedError";
  }
}

export class ServerError extends BaseHttpError {
  constructor(
    message: string,
    statusText: string,
    data?: any,
    config?: HttpRequestConfig,
  ) {
    super(message, 500, statusText, data, config);
    this.name = "ServerError";
  }
}

export type HttpError =
  | NotFoundError
  | UnauthorizedError
  | ServerError
  | BaseHttpError;

export function createHttpError(
  status: number,
  statusText: string,
  message: string,
  data?: any,
  config?: HttpRequestConfig,
): HttpError {
  switch (status) {
    case 404:
      return new NotFoundError(message, statusText, data, config);
    case 401:
      return new UnauthorizedError(message, statusText, data, config);
    case 500:
    case 502:
    case 503:
      return new ServerError(message, statusText, data, config);
    default:
      return new BaseHttpError(message, status, statusText, data, config);
  }
}
