import React, { useEffect, useState } from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import Dashboard from "../pages/Painel";
import TicketResponsiveContainer from "../pages/TicketResponsiveContainer";
import Cadastro from "../pages/Cadastro";
import Login from "../pages/Login";
import MobileLogin from "../pages/MobileLogin";
import Canais from "../pages/Canais";
import SettingsCustom from "../pages/SettingsCustom";
import Financeiro from "../pages/Financeiro";
import Users from "../pages/Users";
import Contatos from "../pages/Contatos";
import ContactImportPage from "../pages/Contatos/import";
import ChatMoments from "../pages/Moments"
import Departamentos from "../pages/Departamentos";
import Etiquetas from "../pages/Etiquetas";
import DocumentacaoPage from "../pages/Documentacao";
import ApiClientesPage from "../pages/api-clientes";
import ApiMensagensPage from "../pages/api-mensagens";
import ApiContatosPage from "../pages/api-contatos";
import ApiTagsPage from "../pages/api-tags";
import ApiProdutosPage from "../pages/api-produtos";
import ApiServicosPage from "../pages/api-servicos";
import ApiUsuariosPage from "../pages/api-usuarios";
import ApiFilasPage from "../pages/api-filas";
import ApiNegociosPage from "../pages/api-negocios";
import ApiTagsKanbanPage from "../pages/api-tags-kanban";
import ApiProjetosPage from "../pages/api-projetos";
import ApiTarefasPage from "../pages/api-tarefas";
import ApiTicketsPage from "../pages/api-tickets";
import ApiConexoesPage from "../pages/api-conexoes";
import ApiFaturasPage from "../pages/api-faturas";
import PublicApiDocs from "../pages/PublicApiDocs";
import Helps from "../pages/Helps";
import ContactLists from "../pages/ContactLists";
import ContactListItems from "../pages/ContactListItems";
import Companies from "../pages/Companies";
import QuickMessages from "../pages/QuickMessages";
import { AuthProvider } from "../context/Auth/AuthContext";
import { PagePermissionsProvider } from "../context/PagePermissionsContext";
import { PlanPermissionsProvider } from "../context/PlanPermissionsContext";
import { TicketsContextProvider } from "../context/Tickets/TicketsContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import Route from "./Route";
import ProtectedRoute from "../components/ProtectedRoute";
import Schedules from "../pages/Lembretes";
import Campanhas from "../pages/Campanhas";
import CampaignsConfig from "../pages/CampaignsConfig";
import CampaignReport from "../pages/CampaignReport";
import Annoucements from "../pages/Annoucements";
import Faturas from "../pages/Faturas";
import DetalhesFaturas from "../pages/Faturas/detalhesFaturas";
import Chat from "../pages/Chat";
import Agentes from "../pages/Agentes";
import ForgetPassword from "../pages/ForgetPassWord/";
import AllConnections from "../pages/AllConnections";
import Reports from "../pages/Relatorios";
import { FlowBuilderConfig } from "../pages/FlowBuilderConfig";
import FlowBuilder from "../pages/FlowBuilder";
import FlowDefault from "../pages/FlowDefault"
import CampaignsPhrase from "../pages/CampaignsPhrase";
import Subscription from "../pages/Subscription";
import QueueIntegration from "../pages/Integracao";
import Files from "../pages/Files";
import Produtos from "../pages/Produtos";
import CatalogoProdutos from "../pages/CatalogoProdutos";
import Kanban from "../pages/Kanban";
import TagsKanban from "../pages/TagsKanban";
import empresa from "../pages/Empresa";
import IaWorkflows from "../pages/IaWorkflows";
import IaWorkflowEditor from "../pages/IaWorkflowEditor";
import TutorialVideos from "../pages/TutorialVideos";
import SliderBannersPage from "../pages/SliderBanners";
import ServicosPage from "../pages/Servicos";
import ServiceOrdersPage from "../pages/ServiceOrders";
import ProfissionaisPage from "../pages/Profissionais";
import Automations from "../pages/Automations";
import Sistema from "../pages/Sistema";
import PaymentSettings from "../pages/PaymentSettings";
import IntegrationSettings from "../pages/IntegrationSettings";
import FerramentasPage from "../pages/Ferramentas";
import ContactSettings from "../pages/ContactSettings";
import ContactAnalytics from "../pages/ContactAnalytics";
import Leads from "../pages/Leads";
import Clients from "../pages/Clientes";
import Grupos from "../pages/Grupos";
import ClientDetails from "../pages/ClientDetails";
import Projects from "../pages/Projects";
import ProjectDetails from "../pages/ProjectDetails";
import UserSchedules from "../pages/UserSchedules";
import Agenda from "../pages/Agenda";
import CallHistory from "../pages/CallHistory";
import Afiliados from "../pages/Afiliados";
import TranslationManager from "../pages/TranslationManager";
import WhitelabelPage from "../pages/WhitelabelPage";
import EmpresasPage from "../pages/EmpresasPage";
import PlanosPage from "../pages/PlanosPage";
import AdminAfiliados from "../pages/AdminAfiliados";
import AdminCupons from "../pages/AdminCupons";
import AdminComissoes from "../pages/AdminComissoes";
import AdminSaques from "../pages/AdminSaques";
import AdminAfiliadoDetalhes from "../pages/AdminAfiliadoDetalhes";

import Funil from "../pages/Funil";
import FeatureDetailPage from "../pages/landingpage/FeatureDetailPage";
import TermsOfService from "../pages/landingpage/TermsOfService";
import UsagePolicy from "../pages/landingpage/UsagePolicy";
import PrivacyPolicy from "../pages/landingpage/PrivacyPolicy";
import PublicCheckout from "../pages/PublicCheckout";
import Atendimentos from "../pages/Atendimentos";
import { QueueSelectedProvider } from "../context/QueuesSelected/QueuesSelectedContext";
import NotificationToast from "../components/NotificationToast";

const Routes = () => {
  const [showCampaigns, setShowCampaigns] = useState(false);

  useEffect(() => {
    const cshow = localStorage.getItem("cshow");
    if (cshow !== undefined) {
      setShowCampaigns(true);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <PagePermissionsProvider>
          <PlanPermissionsProvider>
            <TicketsContextProvider>
              <Switch>
            <Route exact path="/" component={Login} isPublic />
            <Route exact path="/login" component={Login} isPublic />
            <Route exact path="/solucoes/:slug" component={FeatureDetailPage} isPublic />
            <Route exact path="/docs/public/api" component={PublicApiDocs} isPublic />
            <Route exact path="/termos-de-servico" component={TermsOfService} isPublic />
            <Route exact path="/politica-de-uso" component={UsagePolicy} isPublic />
            <Route exact path="/politica-de-privacidade" component={PrivacyPolicy} isPublic />
            <Route exact path="/mobile-login" component={MobileLogin} isPublic />
            <Route exact path="/cadastro" component={Cadastro} isPublic />
            <Route exact path="/forgetpsw" component={ForgetPassword} isPublic />
            <Route exact path="/checkout/:token" component={PublicCheckout} isPublic />
            <Route exact path="/public/checkout/:token" component={PublicCheckout} isPublic />
            
            <WhatsAppsProvider>
              <QueueSelectedProvider>
              <LoggedInLayout>
                <NotificationToast />
                <ProtectedRoute exact path="/financeiro" component={Financeiro} />

                <ProtectedRoute exact path="/companies" component={Companies} />
                <ProtectedRoute exact path="/empresas" component={EmpresasPage} />
                <ProtectedRoute exact path="/planos" component={PlanosPage} />
                <ProtectedRoute exact path="/dashboard" component={Dashboard} />
                <ProtectedRoute exact path="/painel" component={Dashboard} />
                <ProtectedRoute exact path="/tickets/:ticketId?" component={TicketResponsiveContainer} />
                <ProtectedRoute exact path="/conversas/:ticketId?" component={TicketResponsiveContainer} />
                <ProtectedRoute exact path="/grupos/:ticketId?" component={Grupos} />
                <ProtectedRoute exact path="/atendimentos/:ticketId?" component={Atendimentos} />
                <ProtectedRoute exact path="/connections" component={Canais} />
                <ProtectedRoute exact path="/canais" component={Canais} />
                <ProtectedRoute exact path="/quick-messages" component={QuickMessages} />
                <ProtectedRoute exact path="/todolist" component={Produtos} />
                <ProtectedRoute exact path="/produtos" component={Produtos} />
                <ProtectedRoute exact path="/catalogo-produtos" component={CatalogoProdutos} />
                <ProtectedRoute exact path="/schedules" component={Schedules} />
                <ProtectedRoute exact path="/lembretes" component={Schedules} />
                <ProtectedRoute exact path="/tags" component={Etiquetas} />
                <ProtectedRoute exact path="/etiquetas" component={Etiquetas} />
                <ProtectedRoute exact path="/contacts" component={Contatos} />
                <ProtectedRoute exact path="/contatos" component={Contatos} />
                <ProtectedRoute exact path="/contacts/import" component={ContactImportPage} />
                <ProtectedRoute exact path="/contatos/import" component={ContactImportPage} />
                <ProtectedRoute exact path="/helps" component={Helps} />
                <ProtectedRoute exact path="/users" component={Users} />
                <ProtectedRoute exact path="/messages-api" component={DocumentacaoPage} />
                <ProtectedRoute exact path="/messages-api/documentacao" component={ApiClientesPage} />
                <ProtectedRoute exact path="/api-mensagens" component={ApiMensagensPage} />
                <ProtectedRoute exact path="/api-contatos" component={ApiContatosPage} />
                <ProtectedRoute exact path="/api-tags" component={ApiTagsPage} />
                <ProtectedRoute exact path="/api-produtos" component={ApiProdutosPage} />
                <ProtectedRoute exact path="/api-servicos" component={ApiServicosPage} />
                <ProtectedRoute exact path="/api-usuarios" component={ApiUsuariosPage} />
                <ProtectedRoute exact path="/api-filas" component={ApiFilasPage} />
                <ProtectedRoute exact path="/api-negocios" component={ApiNegociosPage} />
                <ProtectedRoute exact path="/api-tags-kanban" component={ApiTagsKanbanPage} />
                <ProtectedRoute exact path="/api-projetos" component={ApiProjetosPage} />
                <ProtectedRoute exact path="/api-tarefas" component={ApiTarefasPage} />
                <ProtectedRoute exact path="/api-tickets" component={ApiTicketsPage} />
                <ProtectedRoute exact path="/api-conexoes" component={ApiConexoesPage} />
                <ProtectedRoute exact path="/api-faturas" component={ApiFaturasPage} />
                <ProtectedRoute exact path="/settings" component={SettingsCustom} />
                <ProtectedRoute exact path="/queues" component={Departamentos} />
                <ProtectedRoute exact path="/departamentos" component={Departamentos} />
                <ProtectedRoute exact path="/relatorios" component={Reports} />
                <ProtectedRoute exact path="/sistema" component={Sistema} />
                <ProtectedRoute exact path="/ferramentas" component={FerramentasPage} />
                <ProtectedRoute exact path="/queue-integration" component={QueueIntegration} />
                <ProtectedRoute exact path="/integracao" component={QueueIntegration} />
                <ProtectedRoute exact path="/announcements" component={Annoucements} />
                <ProtectedRoute exact path="/faturas" component={Faturas} />
                <ProtectedRoute exact path="/faturas/:id" component={DetalhesFaturas} />
                <ProtectedRoute exact path="/documentacao" component={Funil} />
                <ProtectedRoute exact path="/funil" component={Funil} />
                <ProtectedRoute exact path="/empresa" component={empresa} />
                <ProtectedRoute exact path="/payment-settings" component={PaymentSettings} />
                <ProtectedRoute
                  exact
                  path="/integration-settings"
                  component={IntegrationSettings}
                />

                <ProtectedRoute
                  exact
                  path="/phrase-lists"
                  component={CampaignsPhrase}
                />
                <ProtectedRoute
                  exact
                  path="/flowbuilders"
                  component={FlowBuilder}
                />
                <ProtectedRoute
                  exact
                  path="/flowbuilder/:id?"
                  component={FlowBuilderConfig}
                />
                <ProtectedRoute exact path="/chats/:id?" component={Chat} />
                <ProtectedRoute exact path="/files" component={Files} />
                <ProtectedRoute exact path="/moments" component={ChatMoments} />
                <ProtectedRoute exact path="/Kanban" component={Kanban} />
                <ProtectedRoute exact path="/TagsKanban" component={TagsKanban} />
                <ProtectedRoute exact path="/prompts" component={Agentes} />
                <ProtectedRoute exact path="/agentes" component={Agentes} />
                <ProtectedRoute exact path="/ia-workflows" component={IaWorkflows} />
                <ProtectedRoute exact path="/ia-workflows/:id" component={IaWorkflowEditor} />
                <ProtectedRoute exact path="/tutorial-videos" component={TutorialVideos} />
                <ProtectedRoute exact path="/slider-banners" component={SliderBannersPage} />
                <ProtectedRoute exact path="/servicos" component={ServicosPage} />
                <ProtectedRoute exact path="/ordens-servico" component={ServiceOrdersPage} />
                <ProtectedRoute exact path="/profissionais" component={ProfissionaisPage} />
                <ProtectedRoute exact path="/leads" component={Leads} />
                <ProtectedRoute exact path="/clientes" component={Clients} />
                <ProtectedRoute exact path="/clientes/:clientId" component={ClientDetails} />
                <ProtectedRoute exact path="/projects" component={Projects} />
                <ProtectedRoute exact path="/projetos" component={Projects} />
                <ProtectedRoute exact path="/projects/:projectId" component={ProjectDetails} />
                <ProtectedRoute exact path="/user-schedules" component={UserSchedules} />
                <ProtectedRoute exact path="/agendas" component={UserSchedules} />
                                <ProtectedRoute exact path="/appointments" component={Agenda} />
                <ProtectedRoute exact path="/compromissos" component={Agenda} />
                <ProtectedRoute exact path="/automations" component={Automations} />
                <ProtectedRoute exact path="/allConnections" component={AllConnections} />
                <ProtectedRoute
                  exact
                  path="/subscription"
                  component={Subscription}
                />
                <ProtectedRoute exact path="/contact-settings" component={ContactSettings} />
                <ProtectedRoute exact path="/contact-analytics" component={ContactAnalytics} />
                <ProtectedRoute exact path="/call-history" component={CallHistory} />
                <ProtectedRoute exact path="/chamadas" component={CallHistory} />
                <ProtectedRoute exact path="/afiliados" component={Afiliados} />
                <ProtectedRoute exact path="/admin/afiliados/:id" component={AdminAfiliadoDetalhes} />
                <ProtectedRoute exact path="/admin/afiliados" component={AdminAfiliados} />
                <ProtectedRoute exact path="/admin/cupons" component={AdminCupons} />
                <ProtectedRoute exact path="/admin/comissoes" component={AdminComissoes} />
                <ProtectedRoute exact path="/admin/saques" component={AdminSaques} />
                <ProtectedRoute exact path="/translation-manager" component={TranslationManager} />
                <ProtectedRoute exact path="/whitelabel" component={WhitelabelPage} />
                {showCampaigns && (
                  <>
                    <ProtectedRoute exact path="/contact-lists" component={ContactLists} />
                    <ProtectedRoute exact path="/contact-lists/:contactListId/contacts" component={ContactListItems} />
                    <ProtectedRoute exact path="/campaigns" component={Campanhas} />
                    <ProtectedRoute exact path="/campanhas" component={Campanhas} />
                    <ProtectedRoute exact path="/campaign/:campaignId/report" component={CampaignReport} />
                    <ProtectedRoute exact path="/campaigns-config" component={CampaignsConfig} />
                  </>
                )}
              </LoggedInLayout>
              </QueueSelectedProvider>
            </WhatsAppsProvider>
          </Switch>
          <ToastContainer position="top-center" autoClose={3000} />
        </TicketsContextProvider>
        </PlanPermissionsProvider>
        </PagePermissionsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
