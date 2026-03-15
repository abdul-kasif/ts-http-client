import { HttpRequestConfig } from "./types";

export class HttpError extends Error {
  public status: number;
  public statusText: string;
  public data?: any;
  public config?: HttpRequestConfig;

  constructor(
    message: string,
    status: number,
    statusText: string,
    data?: any,
    config?: HttpRequestConfig,
  ) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.config = config;

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
