import Setting from "../../models/Setting";

interface WhitelabelConfig {
  verifyToken?: string;
  facebookAppId?: string;
  facebookAppSecret?: string;
  backendUrl?: string;
  frontendUrl?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleRedirectUri?: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
}

const getWhitelabelSetting = async (companyId: number, key: string): Promise<string | null> => {
  try {
    const setting = await Setting.findOne({
      where: { companyId, key }
    });
    
    return setting?.value || null;
  } catch (error) {
    console.error(`Error fetching whitelabel setting ${key} for company ${companyId}:`, error);
    return null;
  }
};

export const getWhitelabelConfig = async (companyId: number): Promise<WhitelabelConfig> => {
  const [
    verifyToken,
    facebookAppId,
    facebookAppSecret,
    backendUrl,
    frontendUrl,
    googleClientId,
    googleClientSecret,
    googleRedirectUri,
    openaiApiKey,
    geminiApiKey
  ] = await Promise.all([
    getWhitelabelSetting(companyId, "verifyToken"),
    getWhitelabelSetting(companyId, "facebookAppId"),
    getWhitelabelSetting(companyId, "facebookAppSecret"),
    getWhitelabelSetting(companyId, "backendUrl"),
    getWhitelabelSetting(companyId, "frontendUrl"),
    getWhitelabelSetting(companyId, "googleClientId"),
    getWhitelabelSetting(companyId, "googleClientSecret"),
    getWhitelabelSetting(companyId, "googleRedirectUri"),
    getWhitelabelSetting(companyId, "openaiApiKey"),
    getWhitelabelSetting(companyId, "geminiApiKey")
  ]);

  return {
    verifyToken: verifyToken || process.env.VERIFY_TOKEN,
    facebookAppId: facebookAppId || process.env.FACEBOOK_APP_ID,
    facebookAppSecret: facebookAppSecret || process.env.FACEBOOK_APP_SECRET,
    backendUrl: backendUrl || process.env.BACKEND_URL,
    frontendUrl: frontendUrl || process.env.FRONTEND_URL,
    googleClientId: googleClientId || process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: googleClientSecret || process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: googleRedirectUri || process.env.GOOGLE_REDIRECT_URI,
    openaiApiKey: openaiApiKey || process.env.OPENAI_API_KEY,
    geminiApiKey: geminiApiKey || process.env.GEMINI_API_KEY
  };
};

export const getWhitelabelSettingByKey = async (companyId: number, key: keyof WhitelabelConfig): Promise<string> => {
  const config = await getWhitelabelConfig(companyId);
  return config[key] || process.env[key.toUpperCase()] || "";
};
