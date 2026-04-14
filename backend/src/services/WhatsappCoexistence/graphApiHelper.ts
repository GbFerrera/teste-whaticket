import axios, { AxiosInstance, AxiosError, Method } from "axios";

const DEFAULT_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v20.0";

export const getGraphBaseUrl = (): string => {
  const normalized = DEFAULT_GRAPH_VERSION.startsWith("v")
    ? DEFAULT_GRAPH_VERSION
    : `v${DEFAULT_GRAPH_VERSION}`;
  return `https://graph.facebook.com/${normalized}`;
};

export const buildGraphClient = (token: string): AxiosInstance =>
  axios.create({
    baseURL: getGraphBaseUrl(),
    params: {
      access_token: token
    }
  });

export const graphRequest = async <T = any>(
  token: string,
  method: Method,
  path: string,
  data?: any
): Promise<T> => {
  const client = buildGraphClient(token);
  const response = await client.request<T>({
    method,
    url: path,
    data
  });
  return response.data;
};

export const extractGraphError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ error?: { message?: string } }>;
    return err.response?.data?.error?.message || err.message;
  }
  return (error as Error)?.message || "Unexpected error";
};
