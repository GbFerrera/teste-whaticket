import { Router } from "express";

import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import settingRoutes from "./settingRoutes";
import contactRoutes from "./contactRoutes";
import ticketRoutes from "./ticketRoutes";
import userPagePermissionRoutes from "./userPagePermissionRoutes";
import whatsappRoutes from "./whatsappRoutes";
import whatsappCoexistenceRoutes from "./whatsappCoexistenceRoutes";
import whatsappOfficialRoutes from "./whatsappOfficialRoutes";
import messageRoutes from "./messageRoutes";
import whatsappSessionRoutes from "./whatsappSessionRoutes";
import queueRoutes from "./queueRoutes";
import companyRoutes from "./companyRoutes";
import planRoutes from "./planRoutes";
import ticketNoteRoutes from "./ticketNoteRoutes";
import quickMessageRoutes from "./quickMessageRoutes";
import helpRoutes from "./helpRoutes";
import dashboardRoutes from "./dashboardRoutes";
import scheduleRoutes from "./scheduleRoutes";
import tagRoutes from "./tagRoutes";
import contactListRoutes from "./contactListRoutes";
import contactListItemRoutes from "./contactListItemRoutes";
import campaignRoutes from "./campaignRoutes";
import campaignSettingRoutes from "./campaignSettingRoutes";
import announcementRoutes from "./announcementRoutes";
import chatRoutes from "./chatRoutes";
import queueIntegrationRoutes from "./queueIntegrationRoutes";
import chatBotRoutes from "./chatBotRoutes";
import webHookRoutes from "./webHookRoutes";
import webhookListRoutes from "./webhookListRoutes";
import subScriptionRoutes from "./subScriptionRoutes";
import invoiceRoutes from "./invoicesRoutes";
import faturasRoutes from "./faturasRoutes";
import apiRoutes from "./apiRoutes";
import versionRouter from "./versionRoutes";
import filesRoutes from "./filesRoutes";
import queueOptionRoutes from "./queueOptionRoutes";
import ticketTagRoutes from "./ticketTagRoutes";
import apiCompanyRoutes from "./api/apiCompanyRoutes";
import apiContactRoutes from "./api/apiContactRoutes";
import apiMessageRoutes from "./api/apiMessageRoutes";
import externalClientRoutes from "./api/externalClientRoutes";
import externalContactRoutes from "./api/externalContactRoutes";
import externalTagRoutes from "./api/externalTagRoutes";
import externalProductRoutes from "./api/externalProductRoutes";
import externalServiceRoutes from "./api/externalServiceRoutes";
import externalQueueRoutes from "./api/externalQueueRoutes";
import externalNegocioRoutes from "./api/externalNegocioRoutes";
import googleSheetsRoutes from "./googleSheetsRoutes";
import externalTagKanbanRoutes from "./api/externalTagKanbanRoutes";
import externalProjectRoutes from "./api/externalProjectRoutes";
import externalProjectTaskRoutes from "./api/externalProjectTaskRoutes";
import externalUserRoutes from "./api/externalUserRoutes";
import externalTicketRoutes from "./api/externalTicketRoutes";
import externalWhatsappRoutes from "./api/externalWhatsappRoutes";
import externalFaturaRoutes from "./api/externalFaturaRoutes";
import companySettingsRoutes from "./companySettingsRoutes";
import promptRoutes from "./promptRouter";
import iaWorkflowRoutes from "./iaWorkflowRoutes";
import statisticsRoutes from "./statisticsRoutes";
import scheduleMessageRoutes from "./ScheduledMessagesRoutes";
import flowDefaultRoutes from "./flowDefaultRoutes";
import webHook from "./webHookRoutes";
import flowBuilder from "./flowBuilderRoutes";
import flowCampaignRoutes from "./flowCampaignRoutes";
import forgotsRoutes from "./forgotPasswordRoutes";
import imaginasoftRoutes from "./imaginasoftRoutes";
import clinicChatRoutes from './clinicChatRoutes';
import negocioRoutes from "./negocioRoutes";
import produtoRoutes from "./produtoRoutes";
import ferramentaRoutes from "./ferramentaRoutes";
import googleCalendarRoutes from "./googleCalendarRoutes";
import userGoogleCalendarRoutes from "./userGoogleCalendarRoutes";
import facebookOAuthRoutes from "./facebookOAuthRoutes";
// import mobileWebhookRoutes from "./mobileWebhookRoutes";
import emailRoutes from "./emailRoutes";
import tutorialVideoRoutes from "./tutorialVideoRoutes";
import sliderHomeRoutes from "./sliderHomeRoutes";
import profissionalRoutes from "./profissionalRoutes";
import servicoRoutes from "./servicoRoutes";
import crmLeadRoutes from "./crmLeadRoutes";
import crmClientRoutes from "./crmClientRoutes";
import automationRoutes from "./automationRoutes";
import financeiroFaturaRoutes from "./financeiroFaturaRoutes";
import financeiroPagamentoRoutes from "./financeiroPagamentoRoutes";
import paymentSettingRoutes from "./paymentSettingRoutes";
import integrationSettingRoutes from "./integrationSettingRoutes";
import companyApiKeyRoutes from "./companyApiKeyRoutes";
import paymentGatewayWebhookRoutes from "./paymentGatewayWebhookRoutes";
import checkoutRoutes from "./checkoutRoutes";
import asaasRoutes from "./asaasRoutes";
import scheduledDispatcherRoutes from "./scheduledDispatcherRoutes";
import projectRoutes from "./projectRoutes";
import userScheduleRoutes from "./userScheduleRoutes";
import appointmentRoutes from "./appointmentRoutes";
import externalApiRoutes from "./externalApiRoutes";
import hubChannelRoutes from "../HubEcosystem/routes/hubChannelRoutes";
import followUpRoutes from "./followUpRoutes";
import affiliateRoutes from "./affiliateRoutes";
import couponRoutes from "./couponRoutes";
import hubMessageRoutes from "../HubEcosystem/routes/hubMessageRoutes";
import hubWebhookRoutes from "../HubEcosystem/routes/hubWebhookRoutes";
import contactSettingsRoutes from "./contactSettingsRoutes";
import contactAnalyticsRoutes from "./contactAnalyticsRoutes";
import notificationRoutes from "./notificationRoutes";
import callRecordRoutes from "./callRecordRoutes";
import translationRoutes from "./translationRoutes";
import serviceOrderRoutes from "./serviceOrderRoutes";
import groupRoutes from "./groupRoutes";

const routes = Router();

routes.use(userRoutes);
routes.use("/auth", authRoutes);
routes.use("/api/messages", apiRoutes);
routes.use(settingRoutes);
routes.use(contactRoutes);
routes.use(groupRoutes);
routes.use(ticketRoutes);
routes.use(whatsappRoutes);
routes.use(whatsappCoexistenceRoutes);
routes.use(whatsappOfficialRoutes);
routes.use(messageRoutes);
routes.use(whatsappSessionRoutes);
routes.use(queueRoutes);
routes.use(companyRoutes);
routes.use(planRoutes);
routes.use(ticketNoteRoutes);
routes.use(quickMessageRoutes);
routes.use(helpRoutes);
routes.use(dashboardRoutes);
routes.use(scheduleRoutes);
routes.use(tagRoutes);
routes.use(contactListRoutes);
routes.use(contactListItemRoutes);
routes.use(campaignRoutes);
routes.use(campaignSettingRoutes);
routes.use(announcementRoutes);
routes.use(chatRoutes);
routes.use(chatBotRoutes);
routes.use("/webhook", webHookRoutes);
routes.use(subScriptionRoutes);
routes.use(invoiceRoutes);
routes.use(faturasRoutes);
routes.use(versionRouter);
routes.use(filesRoutes);
routes.use(queueOptionRoutes);
routes.use(queueIntegrationRoutes);
routes.use(ticketTagRoutes);
routes.use("/api", apiCompanyRoutes);
routes.use("/api", apiContactRoutes);
routes.use("/api", apiMessageRoutes);
routes.use("/api/external", externalClientRoutes);
routes.use("/api/external", externalContactRoutes);
routes.use("/api/external", externalTagRoutes);
routes.use("/api/external", externalProductRoutes);
routes.use("/api/external", externalServiceRoutes);
routes.use("/api/external", externalQueueRoutes);
routes.use("/api/external", externalNegocioRoutes);
routes.use("/api/external", externalTagKanbanRoutes);
routes.use("/api/external", externalProjectRoutes);
routes.use("/api/external", externalProjectTaskRoutes);
routes.use("/api/external", externalUserRoutes);
routes.use("/api/external", externalTicketRoutes);
routes.use("/api/external", externalWhatsappRoutes);
routes.use("/api/external", externalFaturaRoutes);
routes.use(forgotsRoutes);
routes.use(flowDefaultRoutes);
routes.use(webHook);
routes.use(webhookListRoutes);
routes.use(flowBuilder);
routes.use(flowCampaignRoutes);
routes.use(promptRoutes);
routes.use(iaWorkflowRoutes);
routes.use(statisticsRoutes);
routes.use(companySettingsRoutes);
routes.use(scheduleMessageRoutes);

routes.use("/api/imaginasoft", imaginasoftRoutes);
routes.use('/api/clinic', clinicChatRoutes);

routes.use(negocioRoutes);
routes.use(produtoRoutes);
routes.use(ferramentaRoutes);

routes.use(googleCalendarRoutes);
routes.use("/google-sheets", googleSheetsRoutes);
routes.use("/google-calendar", userGoogleCalendarRoutes);
routes.use("/user-google-calendar", userGoogleCalendarRoutes);
// routes.use("/mobile-webhook", mobileWebhookRoutes);
routes.use(emailRoutes);
routes.use("/tutorial-videos", tutorialVideoRoutes);
routes.use(sliderHomeRoutes);
routes.use(profissionalRoutes);
routes.use(servicoRoutes);
routes.use(crmLeadRoutes);
routes.use(crmClientRoutes);
routes.use(financeiroFaturaRoutes);
routes.use(financeiroPagamentoRoutes);
routes.use(paymentSettingRoutes);
routes.use(integrationSettingRoutes);
routes.use(companyApiKeyRoutes);
routes.use("/affiliate", affiliateRoutes);
routes.use("/coupon", couponRoutes);
routes.use(paymentGatewayWebhookRoutes);
routes.use(checkoutRoutes);
routes.use(asaasRoutes);
routes.use(scheduledDispatcherRoutes);
routes.use(projectRoutes);
routes.use(userScheduleRoutes);
routes.use(appointmentRoutes);
routes.use(followUpRoutes);

// API Externa de Login
routes.use("/api/external", externalApiRoutes);

// HubEcosystem
routes.use(hubChannelRoutes);
routes.use(hubMessageRoutes);
routes.use(hubWebhookRoutes);
routes.use(automationRoutes);

// OAuth Facebook/Instagram
routes.use(facebookOAuthRoutes);

// Configurações e Analytics de Contatos
routes.use(contactSettingsRoutes);
routes.use(contactAnalyticsRoutes);

// Notificações Push
routes.use("/notifications", notificationRoutes);

// Histórico de Chamadas
routes.use(callRecordRoutes);

// Traduções
routes.use(translationRoutes);

// Ordem de Serviço
routes.use(serviceOrderRoutes);

// Permissões de Páginas
routes.use(userPagePermissionRoutes);

export default routes;
