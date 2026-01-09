import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { apiClient, type ApiRequestConfig } from "./client";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface EndpointOptions {
  auth?: boolean; // true = Authorization 付与
  csrf?: boolean; // 明示指定したいとき。未指定なら書き込み系で自動付与
}

export function createEndpoint<Req = void, Res = unknown>(
  method: HttpMethod,
  path: string,
  options: EndpointOptions = {},
) {
  return async (
    params?: Req,
    config: AxiosRequestConfig = {},
  ): Promise<Res> => {
    const reqConfig: ApiRequestConfig = {
      method,
      url: path,
      ...config,
      _auth: options.auth,
      _csrf: options.csrf,
    };

    if (method === "GET" || method === "DELETE") {
      if (params != null) {
        reqConfig.params = params;
      }
    } else {
      if (params != null) {
        reqConfig.data = params;
      }
    }

    const res: AxiosResponse<Res> = await apiClient.request<Res>(reqConfig);
    return res.data;
  };
}
