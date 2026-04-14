import Setting from "../../models/Setting";
import { SendMailWithSettings, replaceVariables } from "../../helpers/SendMailWithSettings";

interface WelcomeData {
  nome: string;
  email: string;
  empresa: string;
  telefone: string;
  plano: string;
  senha: string;
  diasTeste: string;
}

async function getWelcomeSettings(): Promise<{ welcomeEmailText: string; welcomeWhatsappText: string }> {
  try {
    const settings = await Setting.findAll({
      where: {
        companyId: 1,
        key: ["welcomeEmailText", "welcomeWhatsappText"]
      }
    });

    const welcomeEmailText = settings.find(s => s.key === "welcomeEmailText")?.value || "";
    const welcomeWhatsappText = settings.find(s => s.key === "welcomeWhatsappText")?.value || "";

    return { welcomeEmailText, welcomeWhatsappText };
  } catch (error) {
    console.error("Error fetching welcome settings:", error);
    return { welcomeEmailText: "", welcomeWhatsappText: "" };
  }
}

async function getAppName(): Promise<string> {
  try {
    const setting = await Setting.findOne({
      where: {
        companyId: 1,
        key: "appName"
      }
    });
    return setting?.value || "Sistema";
  } catch (error) {
    return "Sistema";
  }
}

export async function sendWelcomeEmail(data: WelcomeData): Promise<boolean> {
  try {
    const { welcomeEmailText } = await getWelcomeSettings();
    const appName = await getAppName();

    if (!welcomeEmailText) {
      console.log("Welcome email text not configured");
      return false;
    }

    const variables: Record<string, string> = {
      nome: data.nome,
      email: data.email,
      empresa: data.empresa,
      telefone: data.telefone,
      plano: data.plano,
      senha: data.senha,
      diasTeste: data.diasTeste
    };

    const emailBody = replaceVariables(welcomeEmailText, variables);

    const result = await SendMailWithSettings({
      to: data.email,
      subject: `Bem-vindo ao ${appName}!`,
      html: emailBody.replace(/\n/g, '<br>')
    });

    if (result) {
      console.log(`Welcome email sent to ${data.email}`);
    }

    return result;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}

export async function getWelcomeWhatsappText(data: WelcomeData): Promise<string | null> {
  try {
    const { welcomeWhatsappText } = await getWelcomeSettings();

    if (!welcomeWhatsappText) {
      console.log("Welcome WhatsApp text not configured");
      return null;
    }

    const variables: Record<string, string> = {
      nome: data.nome,
      email: data.email,
      empresa: data.empresa,
      telefone: data.telefone,
      plano: data.plano,
      senha: data.senha,
      diasTeste: data.diasTeste
    };

    return replaceVariables(welcomeWhatsappText, variables);
  } catch (error) {
    console.error("Error getting welcome WhatsApp text:", error);
    return null;
  }
}

export default { sendWelcomeEmail, getWelcomeWhatsappText };
