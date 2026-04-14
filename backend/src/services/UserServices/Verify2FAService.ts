import speakeasy from "speakeasy";
import User from "../../models/User";
import AppError from "../../errors/AppError";
import { createAccessToken, createRefreshToken } from "../../helpers/CreateTokens";
import { SerializeUser } from "../../helpers/SerializeUser";
import Company from "../../models/Company";
import CompaniesSettings from "../../models/CompaniesSettings";

interface Request {
  email: string;
  token: string;
}

const Verify2FAService = async ({ email, token }: Request) => {
  const user = await User.findOne({
    where: { email },
    include: ["queues", { model: Company, include: [{ model: CompaniesSettings }] }]
  });

  if (!user) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new AppError("ERR_2FA_NOT_ENABLED", 400);
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1
  });

  if (!verified) {
    throw new AppError("ERR_2FA_INVALID_TOKEN", 401);
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  const serializedUser = await SerializeUser(user);

  return {
    serializedUser,
    token: accessToken,
    refreshToken
  };
};

export default Verify2FAService;
