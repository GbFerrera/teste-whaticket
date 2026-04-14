import UserPagePermission from "../models/UserPagePermission";
import User from "../models/User";

interface PagePermission {
  pagePath: string;
  canAccess: boolean;
}

interface UserPagePermissionsData {
  userId: number;
  permissions: PagePermission[];
  pagePermissionsMode: "inherit" | "custom";
}

class UserPagePermissionService {
  // Lista todas as páginas disponíveis no sistema
  static getAvailablePages() {
    return [
      // Painel
      { path: "/painel", name: "Dashboard", group: "Painel", defaultFor: ["admin"] },
      { path: "/relatorios", name: "Relatórios", group: "Painel", defaultFor: ["admin"] },
      
      // Inbox
      { path: "/atendimentos", name: "Conversas", group: "Inbox", defaultFor: ["admin", "user"] },
      { path: "/chamadas", name: "Chamadas", group: "Inbox", defaultFor: ["admin", "user"] },
      
      // Kanban
      { path: "/kanban", name: "Kanban", group: "Kanban", defaultFor: ["admin", "user"] },
      { path: "/funil", name: "Funil", group: "Kanban", defaultFor: ["admin"] },
      { path: "/etiquetas", name: "Etiquetas", group: "Kanban", defaultFor: ["admin"] },
      
      // Usuários
      { path: "/contatos", name: "Contatos", group: "Usuários", defaultFor: ["admin", "user"] },
      { path: "/leads", name: "Leads", group: "Usuários", defaultFor: ["admin", "user"] },
      { path: "/clientes", name: "Clientes", group: "Usuários", defaultFor: ["admin", "user"] },
      { path: "/users", name: "Usuários", group: "Usuários", defaultFor: ["admin"] },
      
      // Automação
      { path: "/agentes", name: "Agente de IA", group: "Automação", defaultFor: ["admin"] },
      { path: "/flowbuilders", name: "Construtor de Fluxo", group: "Automação", defaultFor: ["admin"] },
      { path: "/campanhas", name: "Disparos", group: "Automação", defaultFor: ["admin"] },
      { path: "/phrase-lists", name: "Campanhas", group: "Automação", defaultFor: ["admin"] },
      { path: "/quick-messages", name: "Respostas rápidas", group: "Automação", defaultFor: ["admin", "user"] },
      { path: "/integracao", name: "Integrações", group: "Automação", defaultFor: ["admin"] },
      { path: "/ferramentas", name: "Ferramentas", group: "Automação", defaultFor: ["admin"] },
      
      // Produtividade
      { path: "/produtos", name: "Produtos", group: "Produtividade", defaultFor: ["admin"] },
      { path: "/servicos", name: "Serviços", group: "Produtividade", defaultFor: ["admin"] },
      { path: "/user-schedules", name: "Agenda", group: "Produtividade", defaultFor: ["admin", "user"] },
      { path: "/projects", name: "Projetos", group: "Produtividade", defaultFor: ["admin"] },
      
      // Ajuda
      { path: "/helps", name: "Ajuda", group: "Ajuda", defaultFor: ["admin", "user"] },
      { path: "/messages-api", name: "Documentação", group: "Ajuda", defaultFor: ["admin"] },
      
      // Configurações
      { path: "/canais", name: "Canais", group: "Configurações", defaultFor: ["admin"] },
      { path: "/departamentos", name: "Departamentos", group: "Configurações", defaultFor: ["admin"] },
      { path: "/payment-settings", name: "Pagamentos", group: "Configurações", defaultFor: ["admin"] },
      { path: "/faturas", name: "Faturas", group: "Configurações", defaultFor: ["admin", "user"] },
      
      // Sistema
      { path: "/contact-lists", name: "Lista de contatos", group: "Sistema", defaultFor: ["admin"] },
      { path: "/contatos/import", name: "Importar contatos", group: "Sistema", defaultFor: ["admin"] },
      { path: "/automations", name: "Automações", group: "Sistema", defaultFor: ["admin"] },
      { path: "/financeiro", name: "Financeiro", group: "Sistema", defaultFor: ["admin", "user"] },
      { path: "/lembretes", name: "Lembretes", group: "Sistema", defaultFor: ["admin", "user"] },
      { path: "/settings", name: "Configurações", group: "Sistema", defaultFor: ["admin"] },
      { path: "/afiliados", name: "Meu Painel Afiliado", group: "Sistema", defaultFor: ["admin", "user"] },
      
      // Super Admin
      { path: "/admin/afiliados", name: "Afiliados", group: "Sistema", defaultFor: ["admin"], superAdmin: true },
      { path: "/admin/cupons", name: "Cupons", group: "Sistema", defaultFor: ["admin"], superAdmin: true },
      { path: "/admin/comissoes", name: "Comissões", group: "Sistema", defaultFor: ["admin"], superAdmin: true },
      { path: "/admin/saques", name: "Saques", group: "Sistema", defaultFor: ["admin"], superAdmin: true },
      { path: "/slider-banners", name: "Banners", group: "Sistema", defaultFor: ["admin"], superAdmin: true },
      { path: "/tutorial-videos", name: "Vídeo Tutorial", group: "Sistema", defaultFor: ["admin"], superAdmin: true },
      { path: "/translation-manager", name: "Traduções", group: "Sistema", defaultFor: ["admin"], superAdmin: true },
      { path: "/whitelabel", name: "Whitelabel", group: "Sistema", defaultFor: ["admin"], superAdmin: true },
      { path: "/empresas", name: "Empresas", group: "Sistema", defaultFor: ["admin"], superAdmin: true },
      { path: "/planos", name: "Planos", group: "Sistema", defaultFor: ["admin"], superAdmin: true }
    ];
  }

  // Obtém permissões de um usuário específico
  static async getUserPagePermissions(userId: number) {
    const user = await User.findByPk(userId, {
      include: [{ model: UserPagePermission, as: "pagePermissions" }]
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const availablePages = this.getAvailablePages();
    const permissions: Record<string, boolean> = {};

    // Se o modo for inherit, usa permissões padrão do perfil
    if (user.pagePermissionsMode === "inherit") {
      availablePages.forEach(page => {
        // Admin tem acesso a tudo
        if (user.profile === "admin") {
          permissions[page.path] = true;
        } else {
          // Verifica se a página está disponível para o perfil do usuário
          permissions[page.path] = page.defaultFor?.includes(user.profile) || false;
        }
      });
    } else {
      // Modo custom: usa permissões específicas do banco
      availablePages.forEach(page => {
        const userPermission = user.pagePermissions?.find(p => p.pagePath === page.path);
        permissions[page.path] = userPermission?.canAccess || false;
      });
    }

    return {
      pagePermissionsMode: user.pagePermissionsMode,
      permissions
    };
  }

  // Define permissões de um usuário
  static async setUserPagePermissions(data: UserPagePermissionsData) {
    const { userId, permissions, pagePermissionsMode } = data;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Atualiza o modo de permissões
    await user.update({ pagePermissionsMode });

    // Se for modo custom, atualiza as permissões específicas
    if (pagePermissionsMode === "custom") {
      // Remove todas as permissões existentes
      await UserPagePermission.destroy({ where: { userId } });

      // Cria as novas permissões
      const permissionsToCreate = permissions.map(permission => ({
        userId,
        pagePath: permission.pagePath,
        canAccess: permission.canAccess
      }));

      await UserPagePermission.bulkCreate(permissionsToCreate);
    } else {
      // Se for modo inherit, remove todas as permissões personalizadas
      await UserPagePermission.destroy({ where: { userId } });
    }

    return this.getUserPagePermissions(userId);
  }

  // Verifica se um usuário tem acesso a uma página específica
  static async canUserAccessPage(userId: number, pagePath: string): Promise<boolean> {
    const user = await User.findByPk(userId, {
      include: [{ model: UserPagePermission, as: "pagePermissions" }]
    });

    if (!user) {
      return false;
    }

    // Admin sempre tem acesso
    if (user.profile === "admin") {
      return true;
    }

    // Se o modo for inherit, verifica permissões padrão
    if (user.pagePermissionsMode === "inherit") {
      const availablePages = this.getAvailablePages();
      const page = availablePages.find(p => p.path === pagePath);
      return page?.defaultFor?.includes(user.profile) || false;
    }

    // Se for modo custom, verifica permissão específica
    const permission = user.pagePermissions?.find(p => p.pagePath === pagePath);
    return permission?.canAccess || false;
  }

  // Obtém páginas que um usuário pode acessar (para montar o menu)
  static async getUserAccessiblePages(userId: number) {
    const { permissions } = await this.getUserPagePermissions(userId);
    const availablePages = this.getAvailablePages();

    return availablePages.filter(page => permissions[page.path]);
  }
}

export default UserPagePermissionService;
