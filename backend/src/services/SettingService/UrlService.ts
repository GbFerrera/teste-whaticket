import { getWhitelabelConfig } from "./WhitelabelService";

export const getBackendUrl = async (companyId: number): Promise<string> => {
  const config = await getWhitelabelConfig(companyId);
  return config.backendUrl || process.env.BACKEND_URL || "http://localhost:8090";
};

export const getFrontendUrl = async (companyId: number): Promise<string> => {
  const config = await getWhitelabelConfig(companyId);
  return config.frontendUrl || process.env.FRONTEND_URL || "http://localhost:3000";
};

export const getPublicUrl = async (companyId: number, path: string): Promise<string> => {
  const backendUrl = await getBackendUrl(companyId);
  return `${backendUrl}/public${path}`;
};
