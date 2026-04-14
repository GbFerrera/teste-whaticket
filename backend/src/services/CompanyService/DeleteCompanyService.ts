import path from "path";
import fs from "fs";
import Company from "../../models/Company";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";
import Contact from "../../models/Contact";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";
import TicketTraking from "../../models/TicketTraking";
import CompaniesSettings from "../../models/CompaniesSettings";
import Invoices from "../../models/Invoices";
import UserRating from "../../models/UserRating";
import Prompt from "../../models/Prompt";
import PromptToolSetting from "../../models/PromptToolSetting";
import Tag from "../../models/Tag";
import ContactTag from "../../models/ContactTag";
import ContactWallet from "../../models/ContactWallet";
import ContactCustomField from "../../models/ContactCustomField";
import ContactList from "../../models/ContactList";
import ContactListItem from "../../models/ContactListItem";
import Campaign from "../../models/Campaign";
import CampaignSetting from "../../models/CampaignSetting";
import CampaignShipping from "../../models/CampaignShipping";
import Chat from "../../models/Chat";
import ChatMessage from "../../models/ChatMessage";
import Chatbot from "../../models/Chatbot";
import DialogChatBots from "../../models/DialogChatBots";
import Announcement from "../../models/Announcement";
import QuickMessage from "../../models/QuickMessage";
import Schedule from "../../models/Schedule";
import ScheduledMessages from "../../models/ScheduledMessages";
import ScheduledMessagesEnvio from "../../models/ScheduledMessagesEnvio";
import ScheduledDispatcher from "../../models/ScheduledDispatcher";
import ScheduledDispatchLog from "../../models/ScheduledDispatchLog";
import sequelize from "../../database";
import QueueIntegrations from "../../models/QueueIntegrations";
import { FlowBuilderModel as FlowBuilder } from "../../models/FlowBuilder";
import { FlowCampaignModel as FlowCampaign } from "../../models/FlowCampaign";
import { FlowDefaultModel as FlowDefault } from "../../models/FlowDefault";
import { FlowAudioModel as FlowAudio } from "../../models/FlowAudio";
import { FlowImgModel as FlowImg } from "../../models/FlowImg";
import Files from "../../models/Files";
import Fatura from "../../models/Fatura";
import FinanceiroFatura from "../../models/FinanceiroFatura";
import FinanceiroPagamento from "../../models/FinanceiroPagamento";
import Ferramenta from "../../models/Ferramenta";
import Negocio from "../../models/Negocio";
import Produto from "../../models/Produto";
import Servico from "../../models/Servico";
import Profissional from "../../models/Profissional";
import Project from "../../models/Project";
import ProjectUser from "../../models/ProjectUser";
import ProjectTask from "../../models/ProjectTask";
import ProjectTaskUser from "../../models/ProjectTaskUser";
import ProjectProduct from "../../models/ProjectProduct";
import ProjectService from "../../models/ProjectService";
import Automation from "../../models/Automation";
import IaWorkflow from "../../models/IaWorkflow";
import Appointment from "../../models/Appointment";
import CallRecord from "../../models/CallRecord";
import ApiUsages from "../../models/ApiUsages";
import CompanyApiKey from "../../models/CompanyApiKey";
import CompanyIntegrationSetting from "../../models/CompanyIntegrationSetting";
import CompanyPaymentSetting from "../../models/CompanyPaymentSetting";
import GoogleCalendarIntegration from "../../models/GoogleCalendarIntegration";
import GoogleSheetsToken from "../../models/GoogleSheetsToken";
import MediaFile from "../../models/MediaFile";
import MediaFolder from "../../models/MediaFolder";
import MobileWebhook from "../../models/MobileWebhook";
import Subscriptions from "../../models/Subscriptions";
import SliderHome from "../../models/SliderHome";
import TutorialVideo from "../../models/TutorialVideo";
import UserSchedule from "../../models/UserSchedule";
import UserGoogleCalendarIntegration from "../../models/UserGoogleCalendarIntegration";
import CrmClient from "../../models/CrmClient";
import CrmClientContact from "../../models/CrmClientContact";
import CrmLead from "../../models/CrmLead";
import Baileys from "../../models/Baileys";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const DeleteCompanyService = async (id: string): Promise<void> => {
  console.log("🗑️ INICIANDO EXCLUSÃO DA EMPRESA NO BACKEND:", id);
  
  const company = await Company.findOne({
    where: { id }
  });

  if (!company) {
    console.log("❌ Empresa não encontrada:", id);
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  console.log("✅ Empresa encontrada:", company.name);
  console.log("🧹 Removendo dados relacionados...");

  const runSafeDestroy = async (label: string, destroyFn: () => Promise<any>) => {
    try {
      const result = await destroyFn();
      console.log(`✔️  ${label} removidos (${result || 0})`);
    } catch (error) {
      console.log(`⚠️  Falha ao remover ${label}:`, error?.message || error);
    }
  };

  try {
    // 1. Tabelas dependentes de Ticket (devem ser removidas antes de Tickets)
    await runSafeDestroy("UserRatings", async () => UserRating.destroy({ where: { companyId: id } }));
    await runSafeDestroy("TicketTrakings", async () => TicketTraking.destroy({ where: { companyId: id } }));

    // 2. Mensagens
    await runSafeDestroy("Messages", async () => Message.destroy({ where: { companyId: id } }));

    // 3. Tickets
    await runSafeDestroy("Tickets", async () => Ticket.destroy({ where: { companyId: id } }));

    // 4. Contatos e relacionados
    await runSafeDestroy("ContactTags", async () => {
      const contacts = await Contact.findAll({ where: { companyId: id }, attributes: ["id"] });
      const contactIds = contacts.map(c => c.id);
      if (contactIds.length > 0) {
        await ContactTag.destroy({ where: { contactId: { [Op.in]: contactIds } } });
        await ContactCustomField.destroy({ where: { contactId: { [Op.in]: contactIds } } });
      }
      return contactIds.length;
    });
    await runSafeDestroy("ContactWallets", async () => ContactWallet.destroy({ where: { companyId: id } }));
    await runSafeDestroy("ContactListItems", async () => ContactListItem.destroy({ where: { companyId: id } }));
    await runSafeDestroy("ContactLists", async () => ContactList.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Contacts", async () => Contact.destroy({ where: { companyId: id } }));

    // 5. Tags
    await runSafeDestroy("Tags", async () => Tag.destroy({ where: { companyId: id } }));

    // 6. Campanhas
    await runSafeDestroy("CampaignShippings", async () => {
      const campaigns = await Campaign.findAll({ where: { companyId: id }, attributes: ["id"] });
      const campaignIds = campaigns.map(c => c.id);
      if (campaignIds.length > 0) {
        return CampaignShipping.destroy({ where: { campaignId: { [Op.in]: campaignIds } } });
      }
      return 0;
    });
    await runSafeDestroy("CampaignSettings", async () => CampaignSetting.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Campaigns", async () => Campaign.destroy({ where: { companyId: id } }));

    // 7. Chat interno
    await runSafeDestroy("ChatMessages", async () => {
      const chats = await Chat.findAll({ where: { companyId: id }, attributes: ["id"] });
      const chatIds = chats.map(c => c.id);
      if (chatIds.length > 0) {
        return ChatMessage.destroy({ where: { chatId: { [Op.in]: chatIds } } });
      }
      return 0;
    });
    await runSafeDestroy("Chats", async () => Chat.destroy({ where: { companyId: id } }));

    // 8. Chatbots e DialogChatBots
    await runSafeDestroy("DialogChatBots/Chatbots", async () => {
      const queues = await Queue.findAll({ where: { companyId: id }, attributes: ["id"] });
      const queueIds = queues.map(q => q.id);
      if (queueIds.length > 0) {
        const chatbots = await Chatbot.findAll({ where: { queueId: { [Op.in]: queueIds } }, attributes: ["id"] });
        const chatbotIds = chatbots.map(cb => cb.id);
        if (chatbotIds.length > 0) {
          await DialogChatBots.destroy({ where: { chatbotId: { [Op.in]: chatbotIds } } });
        }
        await Chatbot.destroy({ where: { queueId: { [Op.in]: queueIds } } });
      }
      return 0;
    });

    // 9. Agendamentos
    await runSafeDestroy("ScheduledDispatchLogs", async () => ScheduledDispatchLog.destroy({ where: { companyId: id } }));
    await runSafeDestroy("ScheduledDispatchers", async () => ScheduledDispatcher.destroy({ where: { companyId: id } }));
    await runSafeDestroy("ScheduledMessagesEnvios", async () => ScheduledMessagesEnvio.destroy({ where: { companyId: id } }));
    await runSafeDestroy("ScheduledMessages", async () => ScheduledMessages.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Schedules", async () => Schedule.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Appointments", async () => Appointment.destroy({ where: { companyId: id } }));

    // 10. FlowBuilder (uses company_id snake_case)
    await runSafeDestroy("FlowCampaigns", async () => FlowCampaign.destroy({ where: { companyId: id } }));
    await runSafeDestroy("FlowDefaults", async () => FlowDefault.destroy({ where: { companyId: id } }));
    await runSafeDestroy("FlowAudios", async () => FlowAudio.destroy({ where: { companyId: id } }));
    await runSafeDestroy("FlowImgs", async () => FlowImg.destroy({ where: { companyId: id } }));
    await runSafeDestroy("FlowBuilders", async () => FlowBuilder.destroy({ where: { company_id: id } }));

    // 11. Integrações (Integrations not registered in Sequelize - use raw query)
    await runSafeDestroy("QueueIntegrations", async () => QueueIntegrations.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Integrations", async () => {
      const [, result] = await sequelize.query(`DELETE FROM "Integrations" WHERE "companyId" = ${Number(id)}`);
      return result;
    });
    await runSafeDestroy("CompanyIntegrationSettings", async () => CompanyIntegrationSetting.destroy({ where: { companyId: id } }));

    // 12. IA e Prompts (Prompts deleted AFTER Whatsapps due to FK Whatsapps_promptId_fkey)
    await runSafeDestroy("PromptToolSettings", async () => PromptToolSetting.destroy({ where: { companyId: id } }));
    await runSafeDestroy("IaWorkflows", async () => IaWorkflow.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Automations", async () => Automation.destroy({ where: { companyId: id } }));

    // 13. Projetos
    await runSafeDestroy("ProjectTaskUsers", async () => ProjectTaskUser.destroy({ where: { companyId: id } }));
    await runSafeDestroy("ProjectTasks", async () => ProjectTask.destroy({ where: { companyId: id } }));
    await runSafeDestroy("ProjectProducts", async () => ProjectProduct.destroy({ where: { companyId: id } }));
    await runSafeDestroy("ProjectServices", async () => ProjectService.destroy({ where: { companyId: id } }));
    await runSafeDestroy("ProjectUsers", async () => ProjectUser.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Projects", async () => Project.destroy({ where: { companyId: id } }));

    // 14. Financeiro
    await runSafeDestroy("FinanceiroPagamentos", async () => FinanceiroPagamento.destroy({ where: { companyId: id } }));
    await runSafeDestroy("FinanceiroFaturas", async () => FinanceiroFatura.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Faturas", async () => Fatura.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Invoices", async () => Invoices.destroy({ where: { companyId: id } }));

    // 15. CRM
    await runSafeDestroy("CrmClientContacts", async () => {
      const clients = await CrmClient.findAll({ where: { companyId: id }, attributes: ["id"] });
      const clientIds = clients.map(c => c.id);
      if (clientIds.length > 0) {
        return CrmClientContact.destroy({ where: { clientId: { [Op.in]: clientIds } } });
      }
      return 0;
    });
    await runSafeDestroy("CrmClients", async () => CrmClient.destroy({ where: { companyId: id } }));
    await runSafeDestroy("CrmLeads", async () => CrmLead.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Negocios", async () => Negocio.destroy({ where: { companyId: id } }));

    // 16. Produtos e Serviços
    await runSafeDestroy("Produtos", async () => Produto.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Servicos", async () => Servico.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Profissionais", async () => Profissional.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Ferramentas", async () => Ferramenta.destroy({ where: { companyId: id } }));

    // 17. Mídia e Arquivos
    await runSafeDestroy("MediaFiles", async () => MediaFile.destroy({ where: { companyId: id } }));
    await runSafeDestroy("MediaFolders", async () => MediaFolder.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Files", async () => Files.destroy({ where: { companyId: id } }));

    // 18. Diversos
    await runSafeDestroy("Announcements", async () => Announcement.destroy({ where: { companyId: id } }));
    await runSafeDestroy("QuickMessages", async () => QuickMessage.destroy({ where: { companyId: id } }));
    await runSafeDestroy("CallRecords", async () => CallRecord.destroy({ where: { companyId: id } }));
    await runSafeDestroy("ApiUsages", async () => ApiUsages.destroy({ where: { companyId: id } }));
    await runSafeDestroy("MobileWebhooks", async () => MobileWebhook.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Subscriptions", async () => Subscriptions.destroy({ where: { companyId: id } }));
    await runSafeDestroy("SliderBanners", async () => {
      const [, result] = await sequelize.query(`DELETE FROM "SliderBanners" WHERE "companyId" = ${Number(id)}`);
      return result;
    });
    await runSafeDestroy("SliderHomes", async () => SliderHome.destroy({ where: { companyId: id } }));
    await runSafeDestroy("TutorialVideos", async () => TutorialVideo.destroy({ where: { companyId: id } }));

    // 19. Google
    await runSafeDestroy("UserGoogleCalendarIntegrations", async () => UserGoogleCalendarIntegration.destroy({ where: { companyId: id } }));
    await runSafeDestroy("GoogleCalendarIntegrations", async () => GoogleCalendarIntegration.destroy({ where: { companyId: id } }));
    await runSafeDestroy("GoogleSheetsTokens", async () => GoogleSheetsToken.destroy({ where: { companyId: id } }));

    // 20. Configurações da empresa
    await runSafeDestroy("CompanyApiKeys", async () => CompanyApiKey.destroy({ where: { companyId: id } }));
    await runSafeDestroy("CompanyPaymentSettings", async () => CompanyPaymentSetting.destroy({ where: { companyId: id } }));
    await runSafeDestroy("CompaniesSettings", async () => CompaniesSettings.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Settings", async () => Setting.destroy({ where: { companyId: id } }));

    // 21. Baileys (sessões WhatsApp da empresa)
    await runSafeDestroy("Baileys", async () => {
      const whatsapps = await Whatsapp.findAll({ where: { companyId: id }, attributes: ["id"] });
      const whatsappIds = whatsapps.map(w => w.id);
      if (whatsappIds.length > 0) {
        return Baileys.destroy({ where: { whatsappId: whatsappIds } });
      }
      return 0;
    });

    // 22. Conexões WhatsApp (must be before Prompts due to FK Whatsapps_promptId_fkey)
    await runSafeDestroy("Whatsapps", async () => Whatsapp.destroy({ where: { companyId: id } }));

    // 23. Prompts (after Whatsapps, before Queues due to FK Prompts_queueId_fkey)
    await runSafeDestroy("Prompts", async () => Prompt.destroy({ where: { companyId: id } }));

    // 24. Filas (after Prompts due to FK Prompts_queueId_fkey)
    await runSafeDestroy("Queues", async () => Queue.destroy({ where: { companyId: id } }));

    // 25. Usuários
    await runSafeDestroy("UserSchedules", async () => UserSchedule.destroy({ where: { companyId: id } }));
    await runSafeDestroy("Users", async () => User.destroy({ where: { companyId: id } }));

    // 25. Remover pasta pública da empresa
    const companyPublicFolder = path.join(publicFolder, `company${id}`);
    try {
      if (fs.existsSync(companyPublicFolder)) {
        fs.rmSync(companyPublicFolder, { recursive: true, force: true });
        console.log(`✔️  Pasta pública removida: ${companyPublicFolder}`);
      } else {
        console.log(`ℹ️  Pasta pública não encontrada: ${companyPublicFolder}`);
      }
    } catch (error) {
      console.log(`⚠️  Falha ao remover pasta pública:`, error?.message || error);
    }

    // 26. Remover a empresa
    console.log("🗑️ Removendo a empresa...");
    await company.destroy();
    
    console.log("✅ Empresa excluída com sucesso!");
    
  } catch (error) {
    console.log("❌ ERRO durante a exclusão:", error.message);
    throw new AppError(`Erro ao excluir empresa: ${error.message}`, 500);
  }
};

export default DeleteCompanyService;
