import User from "../../models/User";
import AppError from "../../errors/AppError";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import Queue from "../../models/Queue";
import Company from "../../models/Company";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  companyId: number;
  queues: { id: number; name: string; color: string }[];
}

interface Request {
  email: string;
  password: string;
}

interface Response {
  user: SerializedUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

const ExternalAuthService = async ({
  email,
  password
}: Request): Promise<Response> => {
  const user = await User.findOne({
    where: { email },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color"]
      },
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "status"]
      }
    ]
  });

  if (!user) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  // Verificar se a empresa está ativa
  if (user.company && user.company.status === false) {
    throw new AppError("ERR_COMPANY_INACTIVE", 401);
  }

  // Verificar senha
  if (!(await user.checkPassword(password))) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  // Atualizar último login da empresa
  if (user.company) {
    await user.company.update({ lastLogin: new Date() });
  }

  // Atualizar status online do usuário
  await user.update({ online: true });

  const token = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  // Token expira em 15 minutos (900 segundos) - padrão do sistema
  const expiresIn = 900;

  const serializedUser: SerializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    companyId: user.companyId,
    queues: user.queues?.map(queue => ({
      id: queue.id,
      name: queue.name,
      color: queue.color
    })) || []
  };

  return {
    user: serializedUser,
    token,
    refreshToken,
    expiresIn
  };
};

export default ExternalAuthService;
