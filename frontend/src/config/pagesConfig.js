export const PAGES_CONFIG = {
  // Painel
  painel: { 
    group: "Painel", 
    name: "Dashboard", 
    path: "/painel",
    icon: "DashboardIcon",
    defaultFor: ["admin"] 
  },
  relatorios: { 
    group: "Painel", 
    name: "Relatórios", 
    path: "/relatorios",
    icon: "BarChartIcon",
    defaultFor: ["admin"]
  },
  
  // Inbox
  atendimentos: { 
    group: "Inbox", 
    name: "Conversas", 
    path: "/atendimentos",
    icon: "ChatIcon",
    defaultFor: ["admin", "user"]
  },
  chamadas: { 
    group: "Inbox", 
    name: "Chamadas", 
    path: "/chamadas",
    icon: "PhoneIcon",
    defaultFor: ["admin", "user"]
  },
  
  // Kanban
  kanban: { 
    group: "Kanban", 
    name: "Kanban", 
    path: "/kanban",
    icon: "ViewKanbanIcon",
    defaultFor: ["admin", "user"]
  },
  funil: { 
    group: "Kanban", 
    name: "Funil", 
    path: "/funil",
    icon: "FunnelIcon",
    defaultFor: ["admin"]
  },
  etiquetas: { 
    group: "Kanban", 
    name: "Etiquetas", 
    path: "/etiquetas",
    icon: "TagIcon",
    defaultFor: ["admin"]
  },
  
  // Usuários
  contatos: { 
    group: "Usuários", 
    name: "Contatos", 
    path: "/contatos",
    icon: "ContactsIcon",
    defaultFor: ["admin", "user"]
  },
  leads: { 
    group: "Usuários", 
    name: "Leads", 
    path: "/leads",
    icon: "TrendingUpIcon",
    defaultFor: ["admin", "user"]
  },
  clientes: { 
    group: "Usuários", 
    name: "Clientes", 
    path: "/clientes",
    icon: "PeopleIcon",
    defaultFor: ["admin", "user"]
  },
  users: { 
    group: "Usuários", 
    name: "Usuários", 
    path: "/users",
    icon: "GroupIcon",
    defaultFor: ["admin"]
  },
  
  // Automação
  agentes: { 
    group: "Automação", 
    name: "Agente de IA", 
    path: "/agentes",
    icon: "SmartToyIcon",
    defaultFor: ["admin"]
  },
  flowbuilders: { 
    group: "Automação", 
    name: "Construtor de Fluxo", 
    path: "/flowbuilders",
    icon: "AccountTreeIcon",
    defaultFor: ["admin"]
  },
  campanhas: { 
    group: "Automação", 
    name: "Disparos", 
    path: "/campanhas",
    icon: "CampaignIcon",
    defaultFor: ["admin"]
  },
  "phrase-lists": { 
    group: "Automação", 
    name: "Campanhas", 
    path: "/phrase-lists",
    icon: "ListIcon",
    defaultFor: ["admin"]
  },
  "quick-messages": { 
    group: "Automação", 
    name: "Respostas rápidas", 
    path: "/quick-messages",
    icon: "FlashOnIcon",
    defaultFor: ["admin", "user"]
  },
  integracao: { 
    group: "Automação", 
    name: "Integrações", 
    path: "/integracao",
    icon: "IntegrationIcon",
    defaultFor: ["admin"]
  },
  ferramentas: { 
    group: "Automação", 
    name: "Ferramentas", 
    path: "/ferramentas",
    icon: "BuildIcon",
    defaultFor: ["admin"]
  },
  
  // Produtividade
  produtos: { 
    group: "Produtividade", 
    name: "Produtos", 
    path: "/produtos",
    icon: "InventoryIcon",
    defaultFor: ["admin"]
  },
  servicos: { 
    group: "Produtividade", 
    name: "Serviços", 
    path: "/servicos",
    icon: "ServiceIcon",
    defaultFor: ["admin"]
  },
  "user-schedules": { 
    group: "Produtividade", 
    name: "Agenda", 
    path: "/user-schedules",
    icon: "CalendarIcon",
    defaultFor: ["admin", "user"]
  },
  projects: { 
    group: "Produtividade", 
    name: "Projetos", 
    path: "/projects",
    icon: "ProjectIcon",
    defaultFor: ["admin"]
  },
  
  // Ajuda
  helps: { 
    group: "Ajuda", 
    name: "Ajuda", 
    path: "/helps",
    icon: "HelpIcon",
    defaultFor: ["admin", "user"]
  },
  "messages-api": { 
    group: "Ajuda", 
    name: "Documentação", 
    path: "/messages-api",
    icon: "DescriptionIcon",
    defaultFor: ["admin"]
  },
  
  // Configurações
  canais: { 
    group: "Configurações", 
    name: "Canais", 
    path: "/canais",
    icon: "SettingsInputComponentIcon",
    defaultFor: ["admin"]
  },
  departamentos: { 
    group: "Configurações", 
    name: "Departamentos", 
    path: "/departamentos",
    icon: "DepartmentIcon",
    defaultFor: ["admin"]
  },
  "payment-settings": { 
    group: "Configurações", 
    name: "Pagamentos", 
    path: "/payment-settings",
    icon: "PaymentIcon",
    defaultFor: ["admin"]
  },
  faturas: { 
    group: "Configurações", 
    name: "Faturas", 
    path: "/faturas",
    icon: "ReceiptIcon",
    defaultFor: ["admin", "user"]
  },
  
  // Sistema
  "contact-lists": { 
    group: "Sistema", 
    name: "Lista de contatos", 
    path: "/contact-lists",
    icon: "ContactListIcon",
    defaultFor: ["admin"]
  },
  "contatos/import": { 
    group: "Sistema", 
    name: "Importar contatos", 
    path: "/contatos/import",
    icon: "ImportIcon",
    defaultFor: ["admin"]
  },
  automations: { 
    group: "Sistema", 
    name: "Automações", 
    path: "/automations",
    icon: "AutoModeIcon",
    defaultFor: ["admin"]
  },
  financeiro: { 
    group: "Sistema", 
    name: "Financeiro", 
    path: "/financeiro",
    icon: "AttachMoneyIcon",
    defaultFor: ["admin", "user"]
  },
  lembretes: { 
    group: "Sistema", 
    name: "Lembretes", 
    path: "/lembretes",
    icon: "NotificationIcon",
    defaultFor: ["admin", "user"]
  },
  settings: { 
    group: "Sistema", 
    name: "Configurações", 
    path: "/settings",
    icon: "SettingsIcon",
    defaultFor: ["admin"]
  },
  afiliados: { 
    group: "Sistema", 
    name: "Meu Painel Afiliado", 
    path: "/afiliados",
    icon: "AffiliateIcon",
    defaultFor: ["admin", "user"]
  },
  
  // Super Admin
  "admin/afiliados": { 
    group: "Sistema", 
    name: "Afiliados", 
    path: "/admin/afiliados",
    icon: "AdminAffiliateIcon",
    defaultFor: ["admin"],
    superAdmin: true
  },
  "admin/cupons": { 
    group: "Sistema", 
    name: "Cupons", 
    path: "/admin/cupons",
    icon: "CouponIcon",
    defaultFor: ["admin"],
    superAdmin: true
  },
  "admin/comissoes": { 
    group: "Sistema", 
    name: "Comissões", 
    path: "/admin/comissoes",
    icon: "CommissionIcon",
    defaultFor: ["admin"],
    superAdmin: true
  },
  "admin/saques": { 
    group: "Sistema", 
    name: "Saques", 
    path: "/admin/saques",
    icon: "WithdrawIcon",
    defaultFor: ["admin"],
    superAdmin: true
  },
  "slider-banners": { 
    group: "Sistema", 
    name: "Banners", 
    path: "/slider-banners",
    icon: "BannerIcon",
    defaultFor: ["admin"],
    superAdmin: true
  },
  "tutorial-videos": { 
    group: "Sistema", 
    name: "Vídeo Tutorial", 
    path: "/tutorial-videos",
    icon: "VideoIcon",
    defaultFor: ["admin"],
    superAdmin: true
  },
  "translation-manager": { 
    group: "Sistema", 
    name: "Traduções", 
    path: "/translation-manager",
    icon: "TranslateIcon",
    defaultFor: ["admin"],
    superAdmin: true
  },
  whitelabel: { 
    group: "Sistema", 
    name: "Whitelabel", 
    path: "/whitelabel",
    icon: "BrandIcon",
    defaultFor: ["admin"],
    superAdmin: true
  },
  empresas: { 
    group: "Sistema", 
    name: "Empresas", 
    path: "/empresas",
    icon: "BusinessIcon",
    defaultFor: ["admin"],
    superAdmin: true
  },
  planos: { 
    group: "Sistema", 
    name: "Planos", 
    path: "/planos",
    icon: "PlanIcon",
    defaultFor: ["admin"],
    superAdmin: true
  }
};

// Função para obter páginas agrupadas
export const getGroupedPages = () => {
  const grouped = {};
  
  Object.values(PAGES_CONFIG).forEach(page => {
    if (!grouped[page.group]) {
      grouped[page.group] = [];
    }
    grouped[page.group].push(page);
  });
  
  return grouped;
};

// Função para obter páginas disponíveis para um perfil
export const getPagesForProfile = (profile) => {
  return Object.values(PAGES_CONFIG).filter(page => 
    page.defaultFor?.includes(profile) || false
  );
};
