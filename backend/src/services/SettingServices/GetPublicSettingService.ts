import Setting from "../../models/Setting";

interface Request {
  key: string;
}

const publicSettingsKeys = [
  "allowSignup",
  "userCreation",
  "primaryColorLight",
  "primaryColorDark",
  "appLogoLight",
  "appLogoDark",
  "appLogoFavicon",
  "appLogoLoading",
  "appName",
  "termsImage",
  "termsText",
  "trialDays",
  "sidebarIconColor",
  "sidebarTextColor",
  "sidebarActiveBg",
  "sidebarActiveColor",
  "sidebarHoverBg"
]

const GetPublicSettingService = async ({
  key
}: Request): Promise<string | undefined> => {
  

  console.log("|======== GetPublicSettingService ========|")
  console.log("key", key)
  console.log("|=========================================|")

  if (!publicSettingsKeys.includes(key)) {
    return null;
  }
  
  const setting = await Setting.findOne({
    where: {
      companyId: 1,
      key
    }
  });

  return setting?.value;
};

export default GetPublicSettingService;
