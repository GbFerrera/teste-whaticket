import { Request, Response } from "express";
import * as Yup from "yup";
import { getIO } from "../libs/socket";
import { isEmpty, isNil } from "lodash";
import CheckSettingsHelper, { CheckSettings1 } from "../helpers/CheckSettings";
import AppError from "../errors/AppError";
import Affiliate from "../models/Affiliate";
import Coupon from "../models/Coupon";
import AffiliateLink from "../models/AffiliateLink";
import { validateCoupon } from "../utils/affiliateUtils";

import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import SimpleListService from "../services/UserServices/SimpleListService";
import CreateCompanyService from "../services/CompanyService/CreateCompanyService";
import { SendMail } from "../helpers/SendMail";
import { SendMailWithSettings, replaceVariables } from "../helpers/SendMailWithSettings";
import { useDate } from "../utils/useDate";
import Setting from "../models/Setting";
import Plan from "../models/Plan";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import { getWbot } from "../libs/wbot";
import FindCompaniesWhatsappService from "../services/CompanyService/FindCompaniesWhatsappService";
import User from "../models/User";

import { head } from "lodash";
import ToggleChangeWidthService from "../services/UserServices/ToggleChangeWidthService";
import APIShowEmailUserService from "../services/UserServices/APIShowEmailUserService";

const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const publicSignupSchema = Yup.object().shape({
  companyName: Yup.string()
    .trim()
    .min(2, "ERR_COMPANY_INVALID_NAME")
    .required("ERR_COMPANY_INVALID_NAME"),
  name: Yup.string()
    .trim()
    .min(2, "ERR_USER_INVALID_NAME")
    .required("ERR_USER_INVALID_NAME"),
  email: Yup.string()
    .trim()
    .email("ERR_INVALID_EMAIL")
    .required("ERR_INVALID_EMAIL"),
  password: Yup.string()
    .min(6, "ERR_INVALID_PASSWORD")
    .matches(/[a-z]/, "ERR_INVALID_PASSWORD")
    .matches(/[A-Z]/, "ERR_INVALID_PASSWORD")
    .matches(/[0-9]/, "ERR_INVALID_PASSWORD")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "ERR_INVALID_PASSWORD")
    .required("ERR_INVALID_PASSWORD"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "ERR_PASSWORD_CONFIRMATION")
    .required("ERR_PASSWORD_CONFIRMATION"),
  phone: Yup.string()
    .min(10, "ERR_INVALID_PHONE")
    .required("ERR_INVALID_PHONE"),
  type: Yup.string()
    .oneOf(["pf", "pj"], "ERR_INVALID_TYPE")
    .default("pf"),
  document: Yup.string()
    .when("type", {
      is: "pf",
      then: Yup.string()
        .matches(/^\d{11}$/, "ERR_INVALID_CPF")
        .required("ERR_CPF_REQUIRED"),
      otherwise: Yup.string()
        .matches(/^\d{14}$/, "ERR_INVALID_CNPJ")
        .required("ERR_CNPJ_REQUIRED")
    }),
  segment: Yup.string().optional(),
  planId: Yup.number()
    .typeError("ERR_INVALID_PLAN")
    .positive("ERR_INVALID_PLAN")
    .integer("ERR_INVALID_PLAN")
    .required("ERR_INVALID_PLAN"),
  affiliateCode: Yup.string().optional(),
  couponCode: Yup.string().optional()
});

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

const formatPhoneToWhatsappJid = (rawPhone?: string): string | null => {
  if (!rawPhone) return null;

  let digits = rawPhone.replace(/\D/g, "");
  if (!digits) return null;

  if ((digits.length === 10 || digits.length === 11) && !digits.startsWith("55")) {
    digits = `55${digits}`;
  }

  if (digits.startsWith("55") && digits.length > 13) {
    // remove duplicated country code if user already included 55
    digits = digits.replace(/^55+/, "55");
  }

  return `${digits}@s.whatsapp.net`;
};


export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId, profile } = req.user;

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber,
    companyId,
    profile
  });

  return res.json({ users, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    email,
    password,
    name,
    companyName,
    phone,
    profile,
    companyId: bodyCompanyId,
    queueIds,
    planId,
    startWork,
    endWork,
    whatsappId,
    allTicket,
    defaultTheme,
    defaultMenu,
    allowGroup,
    allHistoric,
    allUserChat,
    userClosePendingTicket,
    showDashboard,
    defaultTicketsManagerWidth = 550,
    allowRealTime,
    allowConnections,
    confirmPassword,
    status,
    dueDate: bodyDueDate,
    recurrence: bodyRecurrence,
    campaignsEnabled,
    document,
    type,
    segment,
    affiliateCode,
    couponCode
  } = req.body;
  let userCompanyId: number | null = null;

  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    throw new AppError("ERR_EMAIL_REQUIRED", 400);
  }

  if (!password || String(password).trim().length === 0) {
    throw new AppError("ERR_PASSWORD_REQUIRED", 400);
  }

  const sanitizedPhone = typeof phone === "string" ? phone.replace(/\D/g, "") : "";

  if (req.url === "/signup") {
    console.log("[SIGNUP] Dados recebidos:", {
      companyName,
      name,
      email: normalizedEmail,
      phone: sanitizedPhone,
      type,
      document,
      segment,
      planId
    });
    
    try {
      await publicSignupSchema.validate(
        {
          companyName,
          name,
          email: normalizedEmail,
          password,
          confirmPassword,
          phone: sanitizedPhone,
          type,
          document,
          segment,
          planId
        },
        { abortEarly: false }
      );
      
      console.log("[SIGNUP] ✅ Validação passou");
    } catch (error: any) {
      console.log("[SIGNUP] ❌ Erro de validação:", error.errors);
      
      const errMap: Record<string, string> = {
        "ERR_INVALID_TYPE": "Tipo inválido. Use 'pf' para pessoa física ou 'pj' para pessoa jurídica.",
        "ERR_INVALID_CPF": "CPF inválido. Deve conter 11 dígitos numéricos.",
        "ERR_INVALID_CNPJ": "CNPJ inválido. Deve conter 14 dígitos numéricos.",
        "ERR_CPF_REQUIRED": "CPF é obrigatório para pessoa física.",
        "ERR_CNPJ_REQUIRED": "CNPJ é obrigatório para pessoa jurídica.",
        "ERR_INVALID_SEGMENT": "Segmento inválido. Escolha uma das opções disponíveis.",
        "ERR_SEGMENT_REQUIRED": "Segmento é obrigatório.",
        "ERR_COMPANY_INVALID_NAME": "Nome da empresa inválido (mínimo 2 caracteres).",
        "ERR_USER_INVALID_NAME": "Nome do usuário inválido (mínimo 2 caracteres).",
        "ERR_INVALID_EMAIL": "E-mail inválido.",
        "ERR_INVALID_PASSWORD": "Senha inválida (mínimo 6 caracteres, com letras e números).",
        "ERR_PASSWORD_CONFIRMATION": "Confirmação de senha não coincide.",
        "ERR_INVALID_PHONE": "Telefone inválido (mínimo 10 dígitos).",
        "ERR_INVALID_PLAN": "Plano inválido."
      };
      throw new AppError(errMap[error.errors?.[0]] || "ERR_INVALID_SIGNUP_DATA");
    }
  }

  const generatedCompanyName =
    (companyName && companyName.trim()) ||
    (normalizedEmail.includes("@") ? normalizedEmail.split("@")[0] : "") ||
    `empresa-${Date.now()}`;
  const resolvedCompanyName =
    generatedCompanyName.length >= 2 ? generatedCompanyName : `empresa-${Date.now()}`;
  const resolvedUserName = (name && name.trim()) || resolvedCompanyName;

  const parsedPlanId = Number(planId);
  const envPlanId = process.env.DEFAULT_PLAN_ID ? Number(process.env.DEFAULT_PLAN_ID) : undefined;
  const resolvedPlanId = !Number.isNaN(parsedPlanId) && parsedPlanId > 0
    ? parsedPlanId
    : envPlanId && !Number.isNaN(envPlanId) && envPlanId > 0
      ? envPlanId
      : 1;

  const { dateToClient } = useDate();

  if (req.user !== undefined) {
    const { companyId: cId } = req.user;
    userCompanyId = cId;
  }

  if (
    req.url === "/signup" &&
    (await CheckSettings1("userCreation", "enabled")) === "disabled"
  ) {
    throw new AppError("ERR_USER_CREATION_DISABLED", 403);
  } else if (req.url !== "/signup" && req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if (process.env.DEMO === "ON") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  // const companyUser = bodyCompanyId || userCompanyId;
  const companyUser = userCompanyId;

  if (!companyUser) {

    // Busca dias de teste configurados
    let trialDays = 7;
    try {
      const trialDaysSetting = await Setting.findOne({
        where: { companyId: 1, key: "trialDays" }
      });
      if (trialDaysSetting?.value) {
        trialDays = parseInt(trialDaysSetting.value) || 7;
      }
    } catch (e) {
      console.log("Error fetching trialDays setting, using default 7");
    }

    const trialExpirationDate = new Date();
    trialExpirationDate.setDate(trialExpirationDate.getDate() + trialDays);

    const date = trialExpirationDate.toISOString().split("T")[0];

      const resolvedStatus =
      typeof status === "boolean"
        ? status
        : status === "t" || status === "true" || status === "1" || status === 1 || status === "active" || status === "on";

    const resolvedDueDate = bodyDueDate || date;
    const resolvedRecurrence = bodyRecurrence || "MENSAL";
    const resolvedCampaignsEnabled =
      typeof campaignsEnabled === "boolean" ? campaignsEnabled : true;

    // Processar código de afiliado se fornecido
    let referredByCompanyId: number | null = null;
    let resolvedAffiliateId: number | null = null;
    let resolvedAffiliateLinkId: number | null = null;
    if (affiliateCode) {
      const affiliateLink = await AffiliateLink.findOne({
        where: { code: affiliateCode.toUpperCase() }
      });
      
      if (affiliateLink) {
        const affiliate = await Affiliate.findByPk(affiliateLink.affiliateId);
        if (affiliate && affiliate.status === "active") {
          referredByCompanyId = affiliate.companyId;
          resolvedAffiliateId = affiliate.id;
          resolvedAffiliateLinkId = affiliateLink.id;
        }
      }
    }

    // Processar cupom de desconto se fornecido
    let couponId: number | null = null;
    let planAmount = 0;
    if (couponCode) {
      // Obter valor do plano para validar cupom
      const plan = await Plan.findByPk(resolvedPlanId);
      if (plan) {
        planAmount = parseFloat(plan.amount);
        const couponValidation = await validateCoupon(couponCode, planAmount);
        
        if (!couponValidation.valid) {
          throw new AppError(couponValidation.error || "Cupom inválido", 400);
        }
        
        // Buscar cupom para obter ID
        const coupon = await Coupon.findOne({
          where: { code: couponCode.toUpperCase() }
        });
        
        if (coupon) {
          couponId = coupon.id;
          // Incrementar uso do cupom
          await coupon.increment("usedCount");
        }
      }
    }

    const companyData = {
      name: resolvedCompanyName,
      email: normalizedEmail,
      phone: sanitizedPhone,
      planId: resolvedPlanId,
      status: resolvedStatus !== undefined ? resolvedStatus : true,
      dueDate: resolvedDueDate,
      recurrence: resolvedRecurrence,
      document: document || "",
      paymentMethod: "",
      password: password,
      companyUserName: resolvedUserName,
      startWork: startWork,
      endWork: endWork,
      defaultTheme: "light",
      defaultMenu: "closed",
      allowGroup: false,
      allHistoric: false,
      userClosePendingTicket: "enabled",
      showDashboard: "disabled",
      defaultTicketsManagerWidth: 550,
      allowRealTime: "disabled",
      allowConnections: "disabled",
      campaignsEnabled: resolvedCampaignsEnabled,
      type: type || "pf",
      segment: segment || "outros",
      referredBy: referredByCompanyId,
      couponId: couponId,
      affiliateId: resolvedAffiliateId,
      affiliateLinkId: resolvedAffiliateLinkId
    };

    const user = await CreateCompanyService(companyData);

    // Registrar signup no link do afiliado se aplicável
    if (affiliateCode && referredByCompanyId) {
      const affiliateLink = await AffiliateLink.findOne({
        where: { code: affiliateCode.toUpperCase() }
      });
      
      if (affiliateLink) {
        // Incrementar signups no link
        await affiliateLink.increment("signups");
        
        // Atualizar tracking data
        const trackingData = affiliateLink.trackingData || {};
        const today = new Date().toISOString().split('T')[0];
        if (!trackingData[today]) trackingData[today] = { clicks: 0, signups: 0 };
        trackingData[today].signups++;
        await affiliateLink.update({ trackingData });
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || "";

    // Busca nome do plano
    let planName = "Plano Padrão";
    try {
      const plan = await Plan.findByPk(resolvedPlanId);
      if (plan) {
        planName = plan.name;
      }
    } catch (e) {
      console.log("Error fetching plan name");
    }

    // Busca nome do sistema
    let appName = "Sistema";
    try {
      const appNameSetting = await Setting.findOne({
        where: { companyId: 1, key: "appName" }
      });
      if (appNameSetting?.value) {
        appName = appNameSetting.value;
      }
    } catch (e) {
      console.log("Error fetching appName");
    }

    // Variáveis para substituição nas mensagens
    const messageVariables: Record<string, string> = {
      nome: name || resolvedUserName,
      email: normalizedEmail,
      empresa: resolvedCompanyName,
      telefone: sanitizedPhone,
      plano: planName,
      senha: password,
      diasTeste: String(trialDays),
      dataVencimento: dateToClient(date),
      link: frontendUrl,
      sistema: appName
    };

    // Busca textos personalizados de boas-vindas
    let welcomeEmailText = "";
    let welcomeWhatsappText = "";
    try {
      const welcomeSettings = await Setting.findAll({
        where: { companyId: 1, key: ["welcomeEmailText", "welcomeWhatsappText"] }
      });
      welcomeEmailText = welcomeSettings.find(s => s.key === "welcomeEmailText")?.value || "";
      welcomeWhatsappText = welcomeSettings.find(s => s.key === "welcomeWhatsappText")?.value || "";
    } catch (e) {
      console.log("Error fetching welcome message settings");
    }

    // Envia email de boas-vindas
    try {
      let emailBody = "";
      let emailSubject = `Bem-vindo ao ${appName}!`;

      if (welcomeEmailText) {
        // Usa texto personalizado
        emailBody = replaceVariables(welcomeEmailText, messageVariables);
      } else {
        // Usa texto padrão
        emailBody = `Olá ${name}, este é um email sobre o cadastro da ${resolvedCompanyName}!<br><br>
        Segue os dados da sua empresa (teste válido por ${trialDays} dias):<br><br>
        Nome: ${resolvedCompanyName}<br>
        Email: ${normalizedEmail}<br>
        Senha: ${password}<br>
        Válido até: ${dateToClient(date)}${frontendUrl ? `<br><br>Link de acesso à plataforma: <a href="${frontendUrl}" target="_blank">${frontendUrl}</a>` : ""}`;
      }

      await SendMailWithSettings({
        to: normalizedEmail,
        subject: emailSubject,
        html: emailBody.replace(/\n/g, '<br>')
      });
      console.log("Welcome email sent successfully");
    } catch (error) {
      console.log('Não consegui enviar o email:', error);
      // Fallback para método antigo
      try {
        const _email = {
          to: normalizedEmail,
          subject: `Login e senha da Empresa ${resolvedCompanyName}`,
          text: `Olá ${name}, este é um email sobre o cadastro da ${resolvedCompanyName}!<br><br>
          Segue os dados da sua empresa (teste válido por ${trialDays} dias):<br><br>
          Nome: ${resolvedCompanyName}<br>
          Email: ${normalizedEmail}<br>
          Senha: ${password}<br>
          Válido até: ${dateToClient(date)}${frontendUrl ? `<br><br>Link de acesso à plataforma: <a href="${frontendUrl}" target="_blank">${frontendUrl}</a>` : ""}`
        };
        await SendMail(_email);
      } catch (fallbackError) {
        console.log('Fallback email também falhou');
      }
    }

    // Envia WhatsApp de boas-vindas
    try {
      const company = await ShowCompanyService(1);
      const whatsappCompany = await FindCompaniesWhatsappService(company.id);
      const firstWhatsapp = whatsappCompany.whatsapps[0];

      const phoneJid = formatPhoneToWhatsappJid(phone);

      if (
        firstWhatsapp?.status === "CONNECTED" &&
        phoneJid
      ) {
        const wbot = getWbot(firstWhatsapp.id);

        let whatsappBody = "";
        if (welcomeWhatsappText) {
          // Usa texto personalizado
          whatsappBody = replaceVariables(welcomeWhatsappText, messageVariables);
        } else {
          // Usa texto padrão
          whatsappBody = `Olá ${name}, este é uma mensagem sobre o cadastro da ${resolvedCompanyName}!\n\nTeste válido por ${trialDays} dias. Segue os dados da sua empresa:\n\nNome: ${resolvedCompanyName}\nEmail: ${normalizedEmail}\nSenha: ${password}\nVálido até: ${dateToClient(date)}${frontendUrl ? `\n\nLink de acesso à plataforma: ${frontendUrl}` : ""}`;
        }

        const sendOptions: any = { createChat: false };

        await wbot.sendMessage(phoneJid, { text: whatsappBody }, sendOptions);
        console.log("Welcome WhatsApp sent successfully");
      }
    } catch (error) {
      console.log('Não consegui enviar a mensagem WhatsApp:', error);
    }

    return res.status(200).json(user);
  }

  if (companyUser) {
    const user = await CreateUserService({
      email,
      password,
      name,
      profile,
      companyId: companyUser,
      queueIds,
      startWork,
      endWork,
      whatsappId,
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
      allowConnections
    });

    const io = getIO();
    io.of(userCompanyId.toString())
      .emit(`company-${userCompanyId}-user`, {
        action: "create",
        user
      });

    return res.status(200).json(user);
  }
};

// export const store = async (req: Request, res: Response): Promise<Response> => {
//   const {
//     email,
//     password,
//     name,
//     profile,
//     companyId: bodyCompanyId,
//     queueIds
//   } = req.body;
//   let userCompanyId: number | null = null;

//   if (req.user !== undefined) {
//     const { companyId: cId } = req.user;
//     userCompanyId = cId;
//   }

//   if (
//     req.url === "/signup" &&
//     (await CheckSettingsHelper("userCreation")) === "disabled"
//   ) {
//     throw new AppError("ERR_USER_CREATION_DISABLED", 403);
//   } else if (req.url !== "/signup" && req.user.profile !== "admin") {
//     throw new AppError("ERR_NO_PERMISSION", 403);
//   }

//   const user = await CreateUserService({
//     email,
//     password,
//     name,
//     profile,
//     companyId: bodyCompanyId || userCompanyId,
//     queueIds
//   });

//   const io = getIO();
//   io.of(String(companyId))
//  .emit(`company-${userCompanyId}-user`, {
//     action: "create",
//     user
//   });

//   return res.status(200).json(user);
// };

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const { companyId } = req.user;

  const user = await ShowUserService(userId, companyId);

  return res.status(200).json(user);
};

export const showEmail = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.params;

  const user = await APIShowEmailUserService(email);

  return res.status(200).json(user);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {

  // if (req.user.profile !== "admin") {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  if (process.env.DEMO === "ON") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { id: requestUserId, companyId } = req.user;
  const { userId } = req.params;
  const userData = req.body;

  console.log("Backend received userData:", userData);
  console.log("allowContacts value:", userData.allowContacts);

  const user = await UpdateUserService({
    userData,
    userId,
    companyId,
    requestUserId: +requestUserId
  });


  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-user`, {
      action: "update",
      user
    });

  return res.status(200).json(user);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { companyId, id, profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if (process.env.DEMO === "ON") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const user = await User.findOne({
    where: { id: userId }
  });

  if (companyId !== user.companyId) {
    return res.status(400).json({ error: "Você não possui permissão para acessar este recurso!" });
  } else {
    await DeleteUserService(userId, companyId);

    const io = getIO();
    io.of(String(companyId))
      .emit(`company-${companyId}-user`, {
        action: "delete",
        userId
      });

    return res.status(200).json({ message: "User deleted" });
  }

};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.query;
  const { companyId: userCompanyId } = req.user;

  const users = await SimpleListService({
    companyId: companyId ? +companyId : userCompanyId
  });

  return res.status(200).json(users);
};

export const mediaUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { companyId } = req.user;
  const files = req.files as Express.Multer.File[];
  const file = head(files);

  try {
    let user = await User.findByPk(userId);
    user.profileImage = file.filename.replace('/', '-');

    await user.save();

    user = await ShowUserService(userId, companyId);
    
    const io = getIO();
    io.of(String(companyId))
      .emit(`company-${companyId}-user`, {
        action: "update",
        user
      });


    return res.status(200).json({ user, message: "Imagem atualizada" });
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export const toggleChangeWidht = async (req: Request, res: Response): Promise<Response> => {
  var { userId } = req.params;
  const { defaultTicketsManagerWidth } = req.body;

  const { companyId } = req.user;
  const user = await ToggleChangeWidthService({ userId, defaultTicketsManagerWidth });

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-user`, {
      action: "update",
      user
    });

  return res.status(200).json(user);
};

export const checkEmail = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.query;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "E-mail é obrigatório." });
  }

  const existingUser = await User.findOne({
    where: { email: email.trim().toLowerCase() }
  });

  return res.status(200).json({ exists: !!existingUser });
};

// ==================== 2FA Endpoints ====================

export const setup2FA = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId } = req.user;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  if (user.twoFactorEnabled) {
    throw new AppError("2FA já está ativado para este usuário.", 400);
  }

  const secret = speakeasy.generateSecret({
    name: `AtendZappy (${user.email})`,
    issuer: "AtendZappy"
  });

  // Salvar secret temporariamente (ainda não confirmado)
  await user.update({ twoFactorSecret: secret.base32 });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  return res.status(200).json({
    secret: secret.base32,
    qrCode: qrCodeUrl
  });
};

export const confirm2FA = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId } = req.user;
  const { token } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  if (!user.twoFactorSecret) {
    throw new AppError("Configure o 2FA primeiro.", 400);
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1
  });

  if (!verified) {
    throw new AppError("Código inválido. Tente novamente.", 401);
  }

  await user.update({ twoFactorEnabled: true });

  return res.status(200).json({ message: "2FA ativado com sucesso!" });
};

export const disable2FA = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId } = req.user;
  const { token } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  if (!user.twoFactorEnabled) {
    throw new AppError("2FA não está ativado.", 400);
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1
  });

  if (!verified) {
    throw new AppError("Código inválido.", 401);
  }

  await user.update({ twoFactorSecret: null, twoFactorEnabled: false });

  return res.status(200).json({ message: "2FA desativado com sucesso!" });
};

export const adminDisable2FA = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const { companyId, profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const user = await User.findOne({
    where: { id: userId, companyId }
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  await user.update({ twoFactorSecret: null, twoFactorEnabled: false });

  return res.status(200).json({ message: "2FA desativado pelo administrador." });
};