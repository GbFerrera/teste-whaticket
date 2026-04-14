import * as Yup from "yup";

import AppError from "../../errors/AppError";
import ShowUserService from "./ShowUserService";
import Company from "../../models/Company";
import User from "../../models/User";

interface UserData {
  email?: string;
  password?: string;
  name?: string;
  profile?: string;
  companyId?: number;
  queueIds?: number[];
  serviceIds?: number[];
  startWork?: string;
  endWork?: string;
  farewellMessage?: string;
  whatsappId?: number;
  allTicket?: string;
  defaultTheme?: string;
  defaultMenu?: string;
  allowGroup?: boolean;
  allHistoric?: string;
  allUserChat?: string;
  userClosePendingTicket?: string;
  showDashboard?: string;
  defaultTicketsManagerWidth?: number;
  allowRealTime?: string;
  allowConnections?: string;
  allowContacts?: string;
  profileImage?: string;
  userType?: string;
  workDays?: string;
  lunchStart?: string;
  lunchEnd?: string;
}

interface Request {
  userData: UserData;
  userId: string | number;
  companyId: number;
  requestUserId: number;
}

interface Response {
  id: number;
  name: string;
  email: string;
  profile: string;
}

const UpdateUserService = async ({
  userData,
  userId,
  companyId,
  requestUserId
}: Request): Promise<Response | undefined> => {
  const user = await ShowUserService(userId, companyId);

  const requestUser = await User.findByPk(requestUserId);
  const userCompany = await Company.findByPk(user.companyId);

  // Verificar se o usuário está editando a si mesmo
  const isEditingSelf = Number(userId) === Number(requestUserId);

  // Verificar se o usuário pertence à mesma empresa
  if (user.companyId !== companyId) {
    throw new AppError("O usuário não pertence à esta empresa");
  }

  // Se userData.companyId for fornecido e diferente, validar permissão de super admin
  if (userData.companyId && userData.companyId !== companyId && requestUser.super === false) {
    throw new AppError("Você não tem permissão para transferir usuários entre empresas");
  }

  // Se o usuário está editando outro usuário (não a si mesmo), validar permissões
  if (!isEditingSelf) {
    // Verificar se está tentando alterar campos além de nome, email e senha
    const restrictedFields = ['profile', 'userType', 'companyId', 'queueIds', 'serviceIds', 
      'allTicket', 'allHistoric', 'allUserChat', 'userClosePendingTicket', 'showDashboard',
      'allowRealTime', 'allowConnections', 'allowContacts', 'allowGroup'];
    
    const hasRestrictedChanges = restrictedFields.some(field => userData[field] !== undefined);
    
    // Se está tentando alterar campos restritos, precisa ter permissão de admin
    if (hasRestrictedChanges && requestUser.profile !== 'admin') {
      throw new AppError("Você não tem permissão para alterar estes campos");
    }
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    allHistoric: Yup.string(),
    email: Yup.string().email(),
    profile: Yup.string(),
    password: Yup.string()
  });

  const oldUserEmail = user.email;
  
  const {
    email,
    password,
    profile,
    name,
    queueIds = [],
    serviceIds = [],
    startWork,
    endWork,
    farewellMessage,
    whatsappId,
    allTicket,
    defaultTheme,
    defaultMenu,
    allowGroup,
    allHistoric,
    allUserChat,
    userClosePendingTicket,
    showDashboard,
    allowConnections,
    allowContacts,
    defaultTicketsManagerWidth = 550,
    allowRealTime,
    profileImage,
    userType,
    workDays,
    lunchStart,
    lunchEnd
  } = userData;

  const isSeedUser = Boolean(userCompany?.email) && user.email === userCompany?.email;

  try {
    await schema.validate({ email, password, profile, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Seed user pode editar nome, email e senha, mas não pode mudar profile/userType
  if (isSeedUser) {
    // Se está tentando alterar profile ou userType para algo diferente de admin, bloquear
    if ((profile && profile !== "admin") || (userType && userType !== "admin")) {
      throw new AppError("O usuário principal da empresa deve permanecer administrador.");
    }
  }

  // Forçar admin para seed user, mesmo que não tenha sido enviado no payload
  const enforcedProfile = isSeedUser ? "admin" : profile;
  const enforcedUserType = isSeedUser ? "admin" : userType;

  await user.update({
    email,
    password,
    profile: enforcedProfile,
    name,
    startWork,
    endWork,
    farewellMessage,
    whatsappId: whatsappId || null,
    allTicket,
    defaultTheme,
    defaultMenu,
    allowGroup,
    allHistoric,
    allUserChat,
    userClosePendingTicket,
    showDashboard,
    defaultTicketsManagerWidth,
    allowRealTime,
    profileImage,
    allowConnections,
    allowContacts,
    userType: enforcedUserType,
    workDays,
    lunchStart: lunchStart || null,
    lunchEnd: lunchEnd || null
  });

  await user.$set("queues", queueIds);

  // Atualizar serviços vinculados
  if (serviceIds !== undefined) {
    await user.$set("services", serviceIds);
  }

  await user.reload();

  if (userCompany && userCompany.email === oldUserEmail) {
    await userCompany.update({
      email,
      password
    })
  }
  
  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    companyId: user.companyId,
    company: userCompany,
    queues: user.queues,
    services: user.services,
    startWork: user.startWork,
    endWork: user.endWork,
    greetingMessage: user.farewellMessage,
    allTicket: user.allTicket,
    defaultMenu: user.defaultMenu,
    defaultTheme: user.defaultTheme,
    allowGroup: user.allowGroup,
    allHistoric: user.allHistoric,
    userClosePendingTicket: user.userClosePendingTicket,
    showDashboard: user.showDashboard,
    defaultTicketsManagerWidth: user.defaultTicketsManagerWidth,
    allowRealTime: user.allowRealTime,
    allowConnections: user.allowConnections,
    allowContacts: user.allowContacts,
    profileImage: user.profileImage,
    userType: user.userType,
    workDays: user.workDays,
    lunchStart: user.lunchStart,
    lunchEnd: user.lunchEnd
  };

  return serializedUser;
};

export default UpdateUserService;
