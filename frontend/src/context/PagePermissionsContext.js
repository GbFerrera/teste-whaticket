import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import toastError from "../errors/toastError";
import { AuthContext } from "./Auth/AuthContext";

const PagePermissionsContext = createContext();

const PagePermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({});
  const [pagePermissionsMode, setPagePermissionsMode] = useState("inherit");
  const [loading, setLoading] = useState(true);
  const [availablePages, setAvailablePages] = useState({});
  const { user } = useContext(AuthContext);

  // Carrega as permissões do usuário atual
  useEffect(() => {
    loadUserPermissions();
    loadAvailablePages();
  }, []);

  // Recarrega permissões quando o usuário mudar (após login)
  useEffect(() => {
    if (user && user.id) {
      loadUserPermissions();
    }
  }, [user?.id]);

  const loadUserPermissions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/user-accessible-pages");
      
      // Converte o formato agrupado para um objeto de permissões
      const userPermissions = {};
      Object.values(data.pages || {}).forEach(groupPages => {
        groupPages.forEach(page => {
          userPermissions[page.path] = true;
        });
      });
      
      setPermissions(userPermissions);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePages = async () => {
    try {
      const { data } = await api.get("/pages/list");
      setAvailablePages(data.pages || {});
    } catch (err) {
      toastError(err);
    }
  };

  // Verifica se o usuário tem acesso a uma página específica
  const canAccessPage = (pagePath) => {
    if (loading) return true; // Durante carregamento, permite acesso
    
    // Se não tiver permissões carregadas, permite acesso (fallback)
    if (!permissions || Object.keys(permissions).length === 0) {
      return true;
    }
    
    // Verifica se tem permissão explícita para a página
    return permissions[pagePath] === true;
  };

  // Obtém permissões de um usuário específico (para o modal de edição)
  const getUserPermissions = async (userId) => {
    try {
      const { data } = await api.get(`/users/${userId}/page-permissions`);
      return data;
    } catch (err) {
      toastError(err);
      throw err;
    }
  };

  // Define permissões de um usuário específico
  const setUserPermissions = async (userId, permissionsData) => {
    try {
      const { data } = await api.post(`/users/${userId}/page-permissions`, permissionsData);
      
      // Se for o usuário atual, recarrega as permissões
      if (userId === getCurrentUserId()) {
        await loadUserPermissions();
      }
      
      return data;
    } catch (err) {
      toastError(err);
      throw err;
    }
  };

  // Obtém o ID do usuário atual
  const getCurrentUserId = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    return userData.id;
  };

  // Filtra páginas que o usuário pode acessar
  const getAccessiblePages = (pages) => {
    if (loading) return [];
    
    return Object.values(pages).filter(page => {
      // Se for admin, tem acesso a tudo
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (userData.profile === "admin") {
        return true;
      }
      
      // Verifica nas permissões carregadas
      return permissions[page.path] || false;
    });
  };

  // Recarrega as permissões (útil após login/atualização)
  const refreshPermissions = async () => {
    await loadUserPermissions();
  };

  return (
    <PagePermissionsContext.Provider
      value={{
        permissions,
        pagePermissionsMode,
        loading,
        availablePages,
        canAccessPage,
        getUserPermissions,
        setUserPermissions,
        getAccessiblePages,
        refreshPermissions,
        loadAvailablePages
      }}
    >
      {children}
    </PagePermissionsContext.Provider>
  );
};

const usePagePermissions = () => {
  const context = useContext(PagePermissionsContext);
  if (!context) {
    throw new Error("usePagePermissions must be used within a PagePermissionsProvider");
  }
  return context;
};

export { PagePermissionsContext, PagePermissionsProvider, usePagePermissions };
