import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import sequelize from "../../database";
import CompaniesSettings from "../../models/CompaniesSettings";
import Setting from "../../models/Setting";

interface CompanyData {
  name: string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  dueDate?: string;
  recurrence?: string;
  document?: string;
  paymentMethod?: string;
  password?: string;
  companyUserName?: string;
  campaignsEnabled?: boolean;
  type?: "pf" | "pj";
  segment?: string;
  referredBy?: number;
  couponId?: number;
  affiliateId?: number;
  affiliateLinkId?: number;
}

const CreateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const {
    name,
    phone,
    password,
    email,
    status,
    planId,
    dueDate,
    recurrence,
    document,
    paymentMethod,
    companyUserName,
    campaignsEnabled,
    type,
    segment,
    referredBy,
    couponId,
    affiliateId,
    affiliateLinkId
  } = companyData;

  const companySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME")
  });

  try {
    await companySchema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const t = await sequelize.transaction();

  try {
    console.log("[CREATE-COMPANY] Verificando se email já existe:", email);
    
    // Verificar se email já existe
    const existingCompany = await Company.findOne({
      where: { email },
      transaction: t
    });
    
    if (existingCompany) {
      console.log("[CREATE-COMPANY] ❌ Email já existe na empresa:", existingCompany.id);
      await t.rollback();
      throw new AppError("ESSE EMAIL JÁ EXISTE", 400);
    }
    
    // Verificar se usuário já existe
    const existingUser = await User.findOne({
      where: { email },
      transaction: t
    });
    
    if (existingUser) {
      console.log("[CREATE-COMPANY] ❌ Email já existe no usuário:", existingUser.id);
      await t.rollback();
      throw new AppError("ESSE EMAIL JÁ EXISTE", 400);
    }
    
    // Se nome já existe, adicionar sufixo único
    let finalName = name;
    let nameCounter = 1;
    
    while (true) {
      const existingName = await Company.findOne({
        where: { name: finalName },
        transaction: t
      });
      
      if (!existingName) break;
      
      finalName = `${name} (${nameCounter})`;
      nameCounter++;
      
      // Limitar para evitar loop infinito
      if (nameCounter > 100) {
        await t.rollback();
        throw new AppError("NÃO FOI POSSÍVEL CRIAR A EMPRESA", 500);
      }
    }
    
    console.log("[CREATE-COMPANY] ✅ Email não existe, criando empresa com nome:", finalName);

    const company = await Company.create({
      name: finalName,
      phone,
      email,
      status,
      planId,
      dueDate,
      recurrence,
      document,
      paymentMethod,
      type,
      segment,
      referredBy: referredBy || null,
      couponId: couponId || null,
      affiliateId: affiliateId || null,
      affiliateLinkId: affiliateLinkId || null
    },
      { transaction: t }
    );

    const user = await User.create({
      name: companyUserName ? companyUserName : finalName,
      email: company.email,
      password: password ? password : "mudar123",
      profile: "admin",
      userType: "admin",
      companyId: company.id
    },
      { transaction: t }
    );

    const settings = await CompaniesSettings.create({
          companyId: company.id,
          hoursCloseTicketsAuto: "9999999999",
          chatBotType: "text",
          acceptCallWhatsapp: "enabled",
          userRandom: "enabled",
          sendGreetingMessageOneQueues: "enabled",
          sendSignMessage: "enabled",
          sendFarewellWaitingTicket: "disabled",
          userRating: "disabled",
          sendGreetingAccepted: "enabled",
          CheckMsgIsGroup: "enabled",
          sendQueuePosition: "disabled",
          scheduleType: "disabled",
          acceptAudioMessageContact: "enabled",
          sendMsgTransfTicket:"disabled",
          enableLGPD: "disabled",
          requiredTag: "disabled",
          lgpdDeleteMessage: "disabled",
          lgpdHideNumber: "disabled",
          lgpdConsent: "disabled",
          lgpdLink:"",
          lgpdMessage:"",
          createdAt: new Date(),
          updatedAt: new Date(),
          closeTicketOnTransfer: false,
          DirectTicketsToWallets: false
    },{ transaction: t })

    if (typeof campaignsEnabled === "boolean") {
      await Setting.create(
        {
          key: "campaignsEnabled",
          value: `${campaignsEnabled}`,
          companyId: company.id
        },
        { transaction: t }
      );
    }
    
    await t.commit();

    return company;
  } catch (error: any) {
    await t.rollback();
    
    console.log("[CREATE-COMPANY] ❌ Erro capturado:", {
      name: error.name,
      message: error.message,
      errors: error.errors
    });
    
    if (error.name === "SequelizeUniqueConstraintError") {
      console.log("[CREATE-COMPANY] ❌ Constraint violation:", error.errors);
      
      // Verificar qual campo está duplicado
      const duplicatedField = error.errors?.[0]?.path;
      
      if (duplicatedField === "email") {
        throw new AppError("ESSE EMAIL JÁ EXISTE", 400);
      } else if (duplicatedField === "document") {
        throw new AppError("ESSE CNPJ/CPF JÁ EXISTE", 400);
      } else {
        throw new AppError("CAMPO DUPLICADO", 400);
      }
    }
    
    console.log("[CREATE-COMPANY] ❌ Erro geral:", error);
    throw new AppError("NÃO FOI POSSÍVEL CRIAR A EMPRESA", 500);
  }
};

export default CreateCompanyService;