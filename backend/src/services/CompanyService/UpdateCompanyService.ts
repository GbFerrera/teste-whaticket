import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Setting from "../../models/Setting";
import User from "../../models/User";
import Invoices from "../../models/Invoices";
import Plan from "../../models/Plan";

interface CompanyData {
  name: string;
  id?: number | string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
  document?: string;
  paymentMethod?: string;
  password?: string;
}

const UpdateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {

  const company = await Company.findByPk(companyData.id);
  const {
    name,
    phone,
    email,
    status,
    planId,
    campaignsEnabled,
    dueDate,
    recurrence,
    document,
    paymentMethod,
    password
  } = companyData;

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  // Atualizar fatura em aberto se existir e se o plano foi alterado
  if (planId) {
    const openInvoices = await Invoices.findAll({
      where: {
        status: "open",
        companyId: company.id,
      },
    });
    
    // Cancelar faturas duplicadas se houver mais de uma
    if (openInvoices.length > 1) {
      for (const invoice of openInvoices.slice(1)) {
        await invoice.update({ status: "cancelled" });
      }
    }
    
    const plan = await Plan.findByPk(planId);
    
    if (!plan) {
      throw new Error("Plano Não Encontrado.");
    }
    
    // Atualizar a fatura em aberto se existir
    const openInvoice = openInvoices[0];
    if (openInvoice) {
      const valuePlan = plan.amount.replace(",", ".");
      await openInvoice.update({
        value: valuePlan,
        detail: plan.name,
        users: plan.users,
        connections: plan.connections,
        queues: plan.queues,
        dueDate: dueDate,
      });
    }
    // Se não houver fatura em aberto, apenas continua sem erro
  }

  // Verificar se existe outro usuário com esse email em OUTRA empresa
  const existUser = await User.findOne({
    where: {
      email: email
    }
  });

  // Só lança erro se encontrou um usuário com esse email em OUTRA empresa
  if (existUser && existUser.companyId !== company.id) {
    throw new AppError("Usuário já existe com esse e-mail!", 404)
  }

  const user = await User.findOne({
    where: {
      companyId: company.id,
      email: company.email
    }
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404)
  }
  
  await user.update({ email, password });


  await company.update({
    name,
    phone,
    email,
    status,
    planId,
    dueDate,
    recurrence,
    document,
    paymentMethod
  });

  if (companyData.campaignsEnabled !== undefined) {
    const [setting, created] = await Setting.findOrCreate({
      where: {
        companyId: company.id,
        key: "campaignsEnabled"
      },
      defaults: {
        companyId: company.id,
        key: "campaignsEnabled",
        value: `${campaignsEnabled}`
      }
    });
    if (!created) {
      await setting.update({ value: `${campaignsEnabled}` });
    }
  }

  return company;
};

export default UpdateCompanyService;
