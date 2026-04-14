// @ts-nocheck
import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Setting from "../models/Setting";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import ContactCustomField from "../models/ContactCustomField";
import Message from "../models/Message";
import Queue from "../models/Queue";
import WhatsappQueue from "../models/WhatsappQueue";
import UserQueue from "../models/UserQueue";
import Company from "../models/Company";
import Plan from "../models/Plan";
import TicketNote from "../models/TicketNote";
import QuickMessage from "../models/QuickMessage";
import Help from "../models/Help";
import TicketTraking from "../models/TicketTraking";
import UserRating from "../models/UserRating";
import Schedule from "../models/Schedule";
import Tag from "../models/Tag";
import Negocio from "../models/Negocio";
import Produto from "../models/Produto";
import ProdutoCategoria from "../models/ProdutoCategoria";
import ProdutoVariacaoGrupo from "../models/ProdutoVariacaoGrupo";
import ProdutoVariacaoOpcao from "../models/ProdutoVariacaoOpcao";
import ProdutoVariacaoItem from "../models/ProdutoVariacaoItem";
import Ferramenta from "../models/Ferramenta";
import TicketTag from "../models/TicketTag";
import ContactList from "../models/ContactList";
import ContactListItem from "../models/ContactListItem";
import Campaign from "../models/Campaign";
import CampaignSetting from "../models/CampaignSetting";
import Baileys from "../models/Baileys";
import CampaignShipping from "../models/CampaignShipping";
import Announcement from "../models/Announcement";
import Chat from "../models/Chat";
import ChatUser from "../models/ChatUser";
import ChatMessage from "../models/ChatMessage";
import Chatbot from "../models/Chatbot";
import DialogChatBots from "../models/DialogChatBots";
import QueueIntegrations from "../models/QueueIntegrations";
import Invoices from "../models/Invoices";
import Fatura from "../models/Fatura";
import Subscriptions from "../models/Subscriptions";
import ApiUsages from "../models/ApiUsages";
import Files from "../models/Files";
import FilesOptions from "../models/FilesOptions";
import ContactTag from "../models/ContactTag";
import CompaniesSettings from "../models/CompaniesSettings";
import LogTicket from "../models/LogTicket";
import Prompt from "../models/Prompt";
import PromptToolSetting from "../models/PromptToolSetting";
import Partner from "../models/Partner";
import UserPagePermission from "../models/UserPagePermission";
import ContactWallet from "../models/ContactWallet";
import ScheduledMessages from "../models/ScheduledMessages";
import ScheduledMessagesEnvio from "../models/ScheduledMessagesEnvio";
import Versions from "../models/Versions";
import GoogleCalendarIntegration from "../models/GoogleCalendarIntegration";
import { FlowDefaultModel } from "../models/FlowDefault";
import { FlowBuilderModel } from "../models/FlowBuilder";
import { FlowAudioModel } from "../models/FlowAudio";
import { FlowCampaignModel } from "../models/FlowCampaign";
import { FlowImgModel } from "../models/FlowImg";
import { WebhookModel } from "../models/Webhook";
import MobileWebhook from "../models/MobileWebhook";
import TutorialVideo from "../models/TutorialVideo";
import SliderHome from "../models/SliderHome";
import Profissional from "../models/Profissional";
import Servico from "../models/Servico";
import MediaFolder from "../models/MediaFolder";
import MediaFile from "../models/MediaFile";
import Automation from "../models/Automation";
import AutomationAction from "../models/AutomationAction";
import AutomationLog from "../models/AutomationLog";
import AutomationExecution from "../models/AutomationExecution";
import CrmLead from "../models/CrmLead";
import CrmClient from "../models/CrmClient";
import CrmClientOwner from "../models/CrmClientOwner";
import FinanceiroFatura from "../models/FinanceiroFatura";
import FinanceiroPagamento from "../models/FinanceiroPagamento";
import CompanyPaymentSetting from "../models/CompanyPaymentSetting";
import CompanyIntegrationSetting from "../models/CompanyIntegrationSetting";
import CompanyIntegrationFieldMap from "../models/CompanyIntegrationFieldMap";
import CompanyApiKey from "../models/CompanyApiKey";
import CrmClientContact from "../models/CrmClientContact";
import ScheduledDispatcher from "../models/ScheduledDispatcher";
import ScheduledDispatchLog from "../models/ScheduledDispatchLog";
import Project from "../models/Project";
import ProjectService from "../models/ProjectService";
import ProjectProduct from "../models/ProjectProduct";
import ProjectUser from "../models/ProjectUser";
import ProjectTask from "../models/ProjectTask";
import ProjectTaskUser from "../models/ProjectTaskUser";
import UserSchedule from "../models/UserSchedule";
import Appointment from "../models/Appointment";
import UserService from "../models/UserService";
import UserGoogleCalendarIntegration from "../models/UserGoogleCalendarIntegration";
import FollowUp from "../models/FollowUp";
import CallRecord from "../models/CallRecord";
import GoogleSheetsToken from "../models/GoogleSheetsToken";
import UserDevice from "../models/UserDevice";
import Affiliate from "../models/Affiliate";
import AffiliateLink from "../models/AffiliateLink";
import Coupon from "../models/Coupon";
import AffiliateCommission from "../models/AffiliateCommission";
import AffiliateWithdrawal from "../models/AffiliateWithdrawal";
import Language from "../models/Language";
import Translation from "../models/Translation";
import ServiceOrder from "../models/ServiceOrder";
import ServiceOrderItem from "../models/ServiceOrderItem";
// eslint-disable-next-line
const dbConfig = require("../config/database");

const sequelize = new Sequelize(dbConfig);

const models = [
  Company,
  User,
  Contact,
  ContactTag,
  Ticket,
  Message,
  Whatsapp,
  ContactCustomField,
  Setting,
  Queue,
  WhatsappQueue,
  UserQueue,
  Plan,
  TicketNote,
  QuickMessage,
  Help,
  TicketTraking,
  UserRating,
  Schedule,
  Tag,
  Negocio,
  Produto,
  ProdutoCategoria,
  ProdutoVariacaoGrupo,
  ProdutoVariacaoOpcao,
  ProdutoVariacaoItem,
  Ferramenta,
  TicketTag,
  ContactList,
  ContactListItem,
  Campaign,
  CampaignSetting,
  Baileys,
  CampaignShipping,
  Announcement,
  Chat,
  ChatUser,
  ChatMessage,
  Chatbot,
  DialogChatBots,
  QueueIntegrations,
  Invoices,
  Fatura,
  Subscriptions,
  ApiUsages,
  Files,
  FilesOptions,
  CompaniesSettings,
  LogTicket,
  Prompt,
  PromptToolSetting,
  Partner,
  ContactWallet,
  ScheduledMessages,
  ScheduledMessagesEnvio,
  Versions,
  FlowDefaultModel,
  FlowBuilderModel,
  FlowAudioModel,
  FlowCampaignModel,
  FlowImgModel,
  WebhookModel,
  MobileWebhook,
  GoogleCalendarIntegration,
  TutorialVideo,
  SliderHome,
  Profissional,
  Servico,
  MediaFolder,
  MediaFile,
  Automation,
  AutomationAction,
  AutomationLog,
  AutomationExecution,
  CrmLead,
  CrmClient,
  CrmClientOwner,
  FinanceiroFatura,
  FinanceiroPagamento,
  CrmClientContact,
  CompanyPaymentSetting,
  CompanyIntegrationSetting,
  CompanyIntegrationFieldMap,
  CompanyApiKey,
  ScheduledDispatcher,
  ScheduledDispatchLog,
  Project,
  ProjectService,
  ProjectProduct,
  ProjectUser,
  ProjectTask,
  ProjectTaskUser,
  UserSchedule,
  Appointment,
  UserService,
  UserGoogleCalendarIntegration,
  FollowUp,
  GoogleSheetsToken,
  UserDevice,
  CallRecord,
  Affiliate,
  AffiliateLink,
  Coupon,
  AffiliateCommission,
  AffiliateWithdrawal,
  Language,
  Translation,
  ServiceOrder,
  ServiceOrderItem,
  UserPagePermission,
];

sequelize.addModels(models);

export default sequelize;
